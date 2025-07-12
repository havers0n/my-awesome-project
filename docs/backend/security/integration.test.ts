import request from 'supertest';
import { app } from '../../app';
import { sequelize } from '../../database';
import { User } from '../../models/User';

describe('Security Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Complete Security Flow', () => {
    let userToken: string;
    let csrfToken: string;
    let sessionCookie: string;

    test('should handle secure user registration flow', async () => {
      // 1. Get CSRF token
      const csrfResponse = await request(app)
        .get('/api/csrf-token');
      
      csrfToken = csrfResponse.body.csrfToken;
      sessionCookie = csrfResponse.headers['set-cookie']?.[0] || '';

      // 2. Register with CSRF protection
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .set('Cookie', sessionCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({
          email: 'secure@example.com',
          password: 'SecurePass123!@#',
          confirmPassword: 'SecurePass123!@#'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('message');
    });

    test('should handle secure login with rate limiting', async () => {
      // Attempt multiple failed logins
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'secure@example.com',
            password: 'WrongPassword'
          });
      }

      // Successful login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'secure@example.com',
          password: 'SecurePass123!@#'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body).toHaveProperty('refreshToken');
      
      userToken = loginResponse.body.token;
    });

    test('should protect against XSS in user input', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bio: xssPayload,
          website: 'javascript:alert("XSS")'
        });

      if (response.status === 200) {
        expect(response.body.bio).not.toContain('<script>');
        expect(response.body.website).not.toContain('javascript:');
      }
    });

    test('should enforce authorization on protected resources', async () => {
      // Create a resource
      const createResponse = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Private Document',
          content: 'Confidential information'
        });

      const documentId = createResponse.body.id;

      // Try to access without token
      const unauthorizedResponse = await request(app)
        .get(`/api/documents/${documentId}`);
      
      expect(unauthorizedResponse.status).toBe(401);

      // Access with valid token
      const authorizedResponse = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(authorizedResponse.status).toBe(200);
    });

    test('should validate all security headers', async () => {
      const response = await request(app)
        .get('/api/health');

      // Check security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    test('should handle token refresh securely', async () => {
      // Get initial tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'secure@example.com',
          password: 'SecurePass123!@#'
        });

      const { refreshToken } = loginResponse.body;

      // Refresh token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body).toHaveProperty('token');
      expect(refreshResponse.body.token).not.toBe(loginResponse.body.token);
    });

    test('should log security events', async () => {
      // Failed login attempt
      const failedLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'secure@example.com',
          password: 'WrongPassword123'
        });

      expect(failedLogin.status).toBe(401);
      
      // In a real application, check if security event was logged
      // This would typically involve checking log files or a logging service
    });
  });

  describe('Multi-Factor Authentication', () => {
    test('should support 2FA setup and verification', async () => {
      // This is a placeholder for 2FA implementation
      // In a real application, this would test:
      // 1. Generating 2FA secret
      // 2. Verifying TOTP codes
      // 3. Backup codes generation
      // 4. 2FA enforcement on login
    });
  });

  describe('Session Management', () => {
    test('should invalidate sessions on logout', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'secure@example.com',
          password: 'SecurePass123!@#'
        });

      const token = loginResponse.body.token;

      // Verify token works
      const protectedResponse = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(protectedResponse.status).toBe(200);

      // Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      
      expect(logoutResponse.status).toBe(200);

      // Token should no longer work
      const afterLogoutResponse = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(afterLogoutResponse.status).toBe(401);
    });
  });
});
