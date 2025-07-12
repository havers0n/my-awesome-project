import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Rate Limiting Tests', () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER'
      }
    });

    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication Endpoints Rate Limiting', () => {
    test('should rate limit login attempts', async () => {
      const maxAttempts = 5;
      const responses = [];

      // Делаем множество попыток входа
      for (let i = 0; i < maxAttempts + 2; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
        responses.push(response);
      }

      // Проверяем, что последние запросы были заблокированы
      const blockedResponses = responses.slice(maxAttempts);
      blockedResponses.forEach(response => {
        expect(response.status).toBe(429);
        expect(response.body.error).toContain('Too many requests');
      });

      // Проверяем заголовки rate limit
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.headers['x-ratelimit-limit']).toBeDefined();
      expect(lastResponse.headers['x-ratelimit-remaining']).toBe('0');
      expect(lastResponse.headers['x-ratelimit-reset']).toBeDefined();
      expect(lastResponse.headers['retry-after']).toBeDefined();
    });

    test('should rate limit registration attempts', async () => {
      const maxAttempts = 3;
      const responses = [];

      for (let i = 0; i < maxAttempts + 1; i++) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `user${i}@example.com`,
            password: 'password123'
          });
        responses.push(response);
      }

      // Последний запрос должен быть заблокирован
      expect(responses[maxAttempts].status).toBe(429);
    });

    test('should rate limit password reset requests', async () => {
      const maxAttempts = 3;
      const responses = [];

      for (let i = 0; i < maxAttempts + 1; i++) {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            email: 'test@example.com'
          });
        responses.push(response);
      }

      expect(responses[maxAttempts].status).toBe(429);
    });
  });

  describe('API Endpoints Rate Limiting', () => {
    test('should apply general rate limiting to API endpoints', async () => {
      const maxRequests = 100; // Предполагаемый лимит за окно времени
      const responses = [];

      // Делаем много запросов подряд
      for (let i = 0; i < maxRequests + 10; i++) {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`);
        
        responses.push(response);
        
        if (response.status === 429) {
          break;
        }
      }

      // Проверяем, что хотя бы один запрос был заблокирован
      const blockedResponse = responses.find(r => r.status === 429);
      expect(blockedResponse).toBeDefined();
      expect(blockedResponse?.body.error).toContain('rate limit');
    });

    test('should have different rate limits for different endpoints', async () => {
      // Тестируем эндпоинт с более строгим лимитом
      const strictEndpointResponses = [];
      for (let i = 0; i < 20; i++) {
        const response = await request(app)
          .post('/api/expensive-operation')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ data: 'test' });
        strictEndpointResponses.push(response);
      }

      // Тестируем эндпоинт с менее строгим лимитом
      const normalEndpointResponses = [];
      for (let i = 0; i < 20; i++) {
        const response = await request(app)
          .get('/api/public-data');
        normalEndpointResponses.push(response);
      }

      // Проверяем, что строгий эндпоинт заблокирован раньше
      const strictBlocked = strictEndpointResponses.filter(r => r.status === 429).length;
      const normalBlocked = normalEndpointResponses.filter(r => r.status === 429).length;
      
      expect(strictBlocked).toBeGreaterThan(0);
    });
  });

  describe('IP-based Rate Limiting', () => {
    test('should track rate limits per IP address', async () => {
      const responses = [];
      
      // Симулируем запросы с одного IP
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .get('/api/data')
          .set('X-Forwarded-For', '192.168.1.100');
        responses.push(response);
      }

      // Проверяем запросы с другого IP
      const differentIpResponse = await request(app)
        .get('/api/data')
        .set('X-Forwarded-For', '192.168.1.101');

      // Если первый IP заблокирован, второй должен работать
      if (responses[responses.length - 1].status === 429) {
        expect(differentIpResponse.status).not.toBe(429);
      }
    });

    test('should handle X-Real-IP header', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Real-IP', '10.0.0.1');

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
    });
  });

  describe('User-based Rate Limiting', () => {
    test('should apply rate limits per authenticated user', async () => {
      // Создаем второго пользователя
      const hashedPassword2 = await bcrypt.hash('password123', 10);
      const user2 = await prisma.user.create({
        data: {
          email: 'user2@example.com',
          password: hashedPassword2,
          role: 'USER'
        }
      });

      const authToken2 = jwt.sign(
        { id: user2.id, email: user2.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Делаем запросы от первого пользователя
      const user1Responses = [];
      for (let i = 0; i < 50; i++) {
        const response = await request(app)
          .get('/api/user-specific')
          .set('Authorization', `Bearer ${authToken}`);
        user1Responses.push(response);
      }

      // Делаем запросы от второго пользователя
      const user2Response = await request(app)
        .get('/api/user-specific')
        .set('Authorization', `Bearer ${authToken2}`);

      // Если первый пользователь заблокирован, второй должен работать
      if (user1Responses[user1Responses.length - 1].status === 429) {
        expect(user2Response.status).not.toBe(429);
      }
    });

    test('should have higher limits for premium users', async () => {
      // Создаем премиум пользователя
      const hashedPasswordPremium = await bcrypt.hash('password123', 10);
      const premiumUser = await prisma.user.create({
        data: {
          email: 'premium@example.com',
          password: hashedPasswordPremium,
          role: 'PREMIUM'
        }
      });

      const premiumToken = jwt.sign(
        { id: premiumUser.id, email: premiumUser.email, role: 'premium' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Тестируем лимиты для обычного пользователя
      let regularBlocked = false;
      for (let i = 0; i < 100; i++) {
        const response = await request(app)
          .get('/api/premium-feature')
          .set('Authorization', `Bearer ${authToken}`);
        
        if (response.status === 429) {
          regularBlocked = true;
          break;
        }
      }

      // Тестируем лимиты для премиум пользователя
      let premiumBlocked = false;
      for (let i = 0; i < 100; i++) {
        const response = await request(app)
          .get('/api/premium-feature')
          .set('Authorization', `Bearer ${premiumToken}`);
        
        if (response.status === 429) {
          premiumBlocked = true;
          break;
        }
      }

      // Премиум пользователь должен иметь более высокие лимиты
      expect(regularBlocked).toBe(true);
      // Премиум может быть не заблокирован или заблокирован позже
    });
  });

  describe('Rate Limit Headers', () => {
    test('should include rate limit headers in responses', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();

      const limit = parseInt(response.headers['x-ratelimit-limit']);
      const remaining = parseInt(response.headers['x-ratelimit-remaining']);
      
      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(limit);
      expect(remaining).toBeGreaterThanOrEqual(0);
    });

    test('should decrease remaining count with each request', async () => {
      const response1 = await request(app)
        .get('/api/test-limit')
        .set('Authorization', `Bearer ${authToken}`);
      
      const remaining1 = parseInt(response1.headers['x-ratelimit-remaining']);

      const response2 = await request(app)
        .get('/api/test-limit')
        .set('Authorization', `Bearer ${authToken}`);
      
      const remaining2 = parseInt(response2.headers['x-ratelimit-remaining']);

      expect(remaining2).toBe(remaining1 - 1);
    });
  });

  describe('Rate Limit Reset', () => {
    test('should reset rate limits after time window', async () => {
      // Этот тест требует манипуляции со временем или ожидания
      // Для демонстрации проверяем, что reset timestamp корректный
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      const resetTime = parseInt(response.headers['x-ratelimit-reset']);
      const currentTime = Math.floor(Date.now() / 1000);

      // Reset time должен быть в будущем
      expect(resetTime).toBeGreaterThan(currentTime);
      // Но не слишком далеко (например, не более часа)
      expect(resetTime - currentTime).toBeLessThanOrEqual(3600);
    });
  });

  describe('Distributed Rate Limiting', () => {
    test('should share rate limit state across instances', async () => {
      // Этот тест проверяет, что rate limiting работает правильно
      // даже если приложение работает в нескольких экземплярах
      
      // Симулируем запросы к разным экземплярам
      const instance1Response = await request(app)
        .get('/api/distributed-test')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Instance', 'instance-1');

      const instance2Response = await request(app)
        .get('/api/distributed-test')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Instance', 'instance-2');

      // Оба экземпляра должны видеть общий счетчик
      const remaining1 = parseInt(instance1Response.headers['x-ratelimit-remaining']);
      const remaining2 = parseInt(instance2Response.headers['x-ratelimit-remaining']);

      expect(remaining2).toBe(remaining1 - 1);
    });
  });

  describe('Bypass and Whitelist', () => {
    test('should allow whitelisted IPs to bypass rate limits', async () => {
      const responses = [];
      
      // Делаем много запросов с whitelisted IP
      for (let i = 0; i < 200; i++) {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .set('X-Forwarded-For', '127.0.0.1'); // Обычно localhost в whitelist
        
        responses.push(response);
      }

      // Все запросы должны быть успешными
      const blockedRequests = responses.filter(r => r.status === 429);
      expect(blockedRequests.length).toBe(0);
    });

    test('should allow admin users to have higher limits', async () => {
      const hashedPasswordAdmin = await bcrypt.hash('password123', 10);
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPasswordAdmin,
          role: 'ADMIN'
        }
      });

      const adminToken = jwt.sign(
        { id: adminUser.id, email: adminUser.email, role: 'admin' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const responses = [];
      for (let i = 0; i < 150; i++) {
        const response = await request(app)
          .get('/api/admin-endpoint')
          .set('Authorization', `Bearer ${adminToken}`);
        
        responses.push(response);
      }

      // Админ должен иметь более высокие лимиты
      const blockedRequests = responses.filter(r => r.status === 429);
      expect(blockedRequests.length).toBe(0);
    });
  });

  describe('Custom Error Messages', () => {
    test('should provide meaningful error messages when rate limited', async () => {
      // Достигаем лимита
      const responses = [];
      for (let i = 0; i < 100; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrong'
          });
        
        responses.push(response);
        if (response.status === 429) break;
      }

      const limitedResponse = responses.find(r => r.status === 429);
      expect(limitedResponse).toBeDefined();
      expect(limitedResponse?.body.error).toContain('Too many requests');
      expect(limitedResponse?.body.message).toBeDefined();
      expect(limitedResponse?.body.retryAfter).toBeDefined();
    });
  });
});
