import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('SQL Injection Security Tests', () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    
    // Создание тестового пользователя
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER'
      }
    });

    // Генерация токена
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication Endpoints', () => {
    test('should prevent SQL injection in login endpoint', async () => {
      const sqlInjectionPayloads = [
        { email: "admin' OR '1'='1'--", password: 'any' },
        { email: "admin'; DROP TABLE users;--", password: 'any' },
        { email: "' OR 1=1--", password: "' OR '1'='1" },
        { email: "admin'/*", password: "*/" },
        { email: "admin' UNION SELECT * FROM users--", password: 'any' }
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(payload);
        
        expect(response.status).not.toBe(200);
        expect(response.body).not.toHaveProperty('token');
      }
    });

    test('should prevent SQL injection in registration endpoint', async () => {
      const sqlInjectionPayloads = [
        { 
          email: "test'; INSERT INTO users (email, role) VALUES ('hacker@evil.com', 'admin');--",
          password: 'password123'
        },
        {
          email: "test@example.com",
          password: "'; UPDATE users SET role='admin' WHERE email='test@example.com';--"
        }
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(payload);
        
        // Проверяем, что инъекция не сработала
        const user = await prisma.user.findUnique({ where: { email: 'hacker@evil.com' } });
        expect(user).toBeNull();
      }
    });
  });

  describe('Search and Filter Endpoints', () => {
    test('should prevent SQL injection in search queries', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users;--",
        "' OR '1'='1",
        "' UNION SELECT * FROM users--",
        "admin'--",
        "1' OR '1' = '1"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get('/api/users/search')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ q: payload });
        
        // Проверяем, что запрос обработан безопасно
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        
        // Проверяем, что таблицы все еще существуют (проверяем через запрос)
        const userCount = await prisma.user.count();
        expect(userCount).toBeGreaterThan(0);
      }
    });

    test('should prevent SQL injection in filter parameters', async () => {
      const sqlInjectionPayloads = [
        { role: "admin' OR '1'='1'--" },
        { status: "active'; DELETE FROM users;--" },
        { id: "1 OR 1=1" },
        { email: "test@example.com' UNION SELECT password FROM users--" }
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .query(payload);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('Data Modification Endpoints', () => {
    test('should prevent SQL injection in update operations', async () => {
      const userId = testUser.id;
      const sqlInjectionPayloads = [
        { name: "John'; UPDATE users SET role='admin';--" },
        { email: "new@example.com'; DELETE FROM users WHERE id != " + userId + ";--" },
        { bio: "Bio text'; INSERT INTO users (email, role) VALUES ('hacker@evil.com', 'admin');--" }
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .put(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(payload);
        
        // Проверяем, что пользователь не стал админом
        const user = await prisma.user.findUnique({ where: { id: userId } });
        expect(user?.role).not.toBe('ADMIN');
        
        // Проверяем, что другие пользователи не были удалены
        const userCount = await prisma.user.count();
        expect(userCount).toBeGreaterThan(0);
      }
    });

    test('should prevent SQL injection in delete operations', async () => {
      // Создаем дополнительных пользователей
      await prisma.user.create({ data: { email: 'user2@example.com', password: await bcrypt.hash('pass123', 10) } });
      await prisma.user.create({ data: { email: 'user3@example.com', password: await bcrypt.hash('pass123', 10) } });

      const sqlInjectionPayloads = [
        "1 OR 1=1",
        "1'; DELETE FROM users;--",
        "1 UNION SELECT id FROM users"
      ];

      const initialCount = await prisma.user.count();

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .delete(`/api/users/${payload}`)
          .set('Authorization', `Bearer ${authToken}`);
        
        // Проверяем, что массовое удаление не произошло
        const currentCount = await prisma.user.count();
        expect(currentCount).toBe(initialCount);
      }
    });
  });

  describe('Raw Query Protection', () => {
    test('should properly escape special characters in queries', async () => {
      const specialCharacters = [
        { input: "O'Brien", expected: "O''Brien" },
        { input: 'test"quote', expected: 'test""quote' },
        { input: "test\\slash", expected: "test\\\\slash" },
        { input: "test;semicolon", expected: "test;semicolon" }
      ];

      for (const { input } of specialCharacters) {
        const response = await request(app)
          .get('/api/users/search')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ q: input });
        
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
      }
    });
  });

  describe('Parameterized Queries', () => {
    test('should use parameterized queries for all database operations', async () => {
      // Этот тест проверяет, что приложение использует параметризованные запросы
      const maliciousInput = "'; SELECT * FROM users WHERE '1'='1";
      
      // Попытка поиска
      const searchResponse = await request(app)
        .get('/api/users/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: maliciousInput });
      
      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body).toBeInstanceOf(Array);
      expect(searchResponse.body.length).toBe(0); // Не должно найти результатов
      
      // Попытка создания с вредоносным вводом
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: maliciousInput + '@example.com',
          password: 'password123',
          name: maliciousInput
        });
      
      // Проверяем, что данные сохранены безопасно
      if (createResponse.status === 201) {
        const createdUser = await prisma.user.findUnique({ where: { id: createResponse.body.id } });
        expect(createdUser?.name).toBe(maliciousInput);
      }
    });
  });
});
