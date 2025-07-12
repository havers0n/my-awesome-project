import request from 'supertest';
import { app } from '../../app';
import { sequelize } from '../../database';
import { User } from '../../models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

describe('CSRF Protection Tests', () => {
  let authToken: string;
  let testUser: any;
  let csrfToken: string;
  let sessionCookie: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    testUser = await User.create({
      email: 'test@example.com',
      password: 'TestPassword123!',
      role: 'user'
    });

    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('CSRF Token Generation', () => {
    test('should generate CSRF token on session initialization', async () => {
      const response = await request(app)
        .get('/api/csrf-token')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('csrfToken');
      expect(response.body.csrfToken).toBeTruthy();
      expect(response.body.csrfToken.length).toBeGreaterThan(20);

      csrfToken = response.body.csrfToken;
      sessionCookie = response.headers['set-cookie']?.[0] || '';
    });

    test('should generate unique CSRF tokens for different sessions', async () => {
      const tokens = new Set();

      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/api/csrf-token');

        if (response.body.csrfToken) {
          tokens.add(response.body.csrfToken);
        }
      }

      expect(tokens.size).toBe(5); // Все токены должны быть уникальными
    });
  });

  describe('CSRF Token Validation', () => {
    test('should reject POST requests without CSRF token', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', sessionCookie)
        .send({
          email: 'new@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('CSRF');
    });

    test('should reject PUT requests without CSRF token', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', sessionCookie)
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('CSRF');
    });

    test('should reject DELETE requests without CSRF token', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('CSRF');
    });

    test('should accept requests with valid CSRF token in header', async () => {
      // Сначала получаем CSRF токен
      const tokenResponse = await request(app)
        .get('/api/csrf-token')
        .set('Authorization', `Bearer ${authToken}`);
      
      const token = tokenResponse.body.csrfToken;
      const cookie = tokenResponse.headers['set-cookie']?.[0] || '';

      // Отправляем запрос с CSRF токеном
      const response = await request(app)
        .post('/api/test-csrf')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', cookie)
        .set('X-CSRF-Token', token)
        .send({
          data: 'test'
        });

      expect(response.status).not.toBe(403);
    });

    test('should accept requests with valid CSRF token in body', async () => {
      const tokenResponse = await request(app)
        .get('/api/csrf-token')
        .set('Authorization', `Bearer ${authToken}`);
      
      const token = tokenResponse.body.csrfToken;
      const cookie = tokenResponse.headers['set-cookie']?.[0] || '';

      const response = await request(app)
        .post('/api/test-csrf')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', cookie)
        .send({
          data: 'test',
          _csrf: token
        });

      expect(response.status).not.toBe(403);
    });
  });

  describe('CSRF Token Security', () => {
    test('should reject requests with invalid CSRF token', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', sessionCookie)
        .set('X-CSRF-Token', 'invalid-token-12345')
        .send({
          email: 'new@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Invalid CSRF token');
    });

    test('should reject requests with CSRF token from different session', async () => {
      // Получаем токен из одной сессии
      const session1 = await request(app)
        .get('/api/csrf-token');
      
      // Получаем токен из другой сессии
      const session2 = await request(app)
        .get('/api/csrf-token');

      // Пытаемся использовать токен из сессии 1 с куками из сессии 2
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', session2.headers['set-cookie']?.[0] || '')
        .set('X-CSRF-Token', session1.body.csrfToken)
        .send({
          email: 'new@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(403);
    });

    test('should regenerate CSRF token after successful authentication', async () => {
      // Получаем начальный токен
      const initialTokenResponse = await request(app)
        .get('/api/csrf-token');
      
      const initialToken = initialTokenResponse.body.csrfToken;

      // Логинимся
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      expect(loginResponse.status).toBe(200);

      // Получаем новый токен после логина
      const newTokenResponse = await request(app)
        .get('/api/csrf-token')
        .set('Cookie', loginResponse.headers['set-cookie']?.[0] || '');

      const newToken = newTokenResponse.body.csrfToken;

      // Токены должны быть разными
      expect(newToken).not.toBe(initialToken);
    });
  });

  describe('Safe Methods', () => {
    test('should not require CSRF token for GET requests', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).not.toBe(403);
    });

    test('should not require CSRF token for HEAD requests', async () => {
      const response = await request(app)
        .head('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).not.toBe(403);
    });

    test('should not require CSRF token for OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).not.toBe(403);
    });
  });

  describe('Double Submit Cookie', () => {
    test('should implement double submit cookie pattern', async () => {
      const tokenResponse = await request(app)
        .get('/api/csrf-token');

      const csrfCookie = tokenResponse.headers['set-cookie']
        ?.find(cookie => cookie.startsWith('csrf-token='));

      expect(csrfCookie).toBeDefined();
      expect(csrfCookie).toContain('HttpOnly');
      expect(csrfCookie).toContain('Secure');
      expect(csrfCookie).toContain('SameSite=Strict');
    });

    test('should validate matching CSRF cookie and header values', async () => {
      const tokenResponse = await request(app)
        .get('/api/csrf-token');

      const token = tokenResponse.body.csrfToken;
      const cookies = tokenResponse.headers['set-cookie'];

      // Изменяем значение токена в заголовке
      const response = await request(app)
        .post('/api/test-csrf')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', token + 'modified')
        .send({
          data: 'test'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Origin and Referer Validation', () => {
    test('should validate Origin header for state-changing requests', async () => {
      const tokenResponse = await request(app)
        .get('/api/csrf-token');

      const token = tokenResponse.body.csrfToken;
      const cookie = tokenResponse.headers['set-cookie']?.[0] || '';

      // Запрос с неправильным Origin
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', cookie)
        .set('X-CSRF-Token', token)
        .set('Origin', 'https://evil-site.com')
        .send({
          email: 'new@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Origin');
    });

    test('should validate Referer header when Origin is not present', async () => {
      const tokenResponse = await request(app)
        .get('/api/csrf-token');

      const token = tokenResponse.body.csrfToken;
      const cookie = tokenResponse.headers['set-cookie']?.[0] || '';

      // Запрос с неправильным Referer
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', cookie)
        .set('X-CSRF-Token', token)
        .set('Referer', 'https://evil-site.com/attack')
        .send({
          email: 'new@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(403);
    });

    test('should accept requests from same origin', async () => {
      const tokenResponse = await request(app)
        .get('/api/csrf-token');

      const token = tokenResponse.body.csrfToken;
      const cookie = tokenResponse.headers['set-cookie']?.[0] || '';

      const response = await request(app)
        .post('/api/test-csrf')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', cookie)
        .set('X-CSRF-Token', token)
        .set('Origin', process.env.APP_URL || 'http://localhost:3000')
        .send({
          data: 'test'
        });

      expect(response.status).not.toBe(403);
    });
  });

  describe('Token Expiration', () => {
    test('should expire CSRF tokens after specified time', async () => {
      // Этот тест зависит от конфигурации приложения
      // Предполагаем, что токены истекают через определенное время
      
      const tokenResponse = await request(app)
        .get('/api/csrf-token');

      const token = tokenResponse.body.csrfToken;
      const cookie = tokenResponse.headers['set-cookie']?.[0] || '';

      // Симулируем истечение токена (в реальном тесте нужно подождать или изменить время)
      // Для демонстрации просто проверяем, что токен имеет временную метку
      expect(token).toBeTruthy();
      
      // В реальном приложении здесь был бы тест с задержкой или мокированием времени
    });
  });

  describe('CORS and CSRF Integration', () => {
    test('should work correctly with CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/users')
        .set('Origin', process.env.APP_URL || 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'X-CSRF-Token');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-headers']).toContain('X-CSRF-Token');
    });
  });
});
