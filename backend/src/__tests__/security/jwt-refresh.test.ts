import request from 'supertest';
import { app } from '../../app';
import { sequelize } from '../../database';
import { User } from '../../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('JWT and Refresh Mechanism Tests', () => {
  let authToken: string;
  let refreshToken: string;
  let testUser: any;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    testUser = await User.create({
      email: 'test@example.com',
      password: 'TestPassword123!',
      role: 'user'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('JWT Token Creation', () => {
    test('should issue JWT token upon authentication', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');

      // Decode the JWT token
      const decoded = jwt.verify(response.body.token, JWT_SECRET);
      expect(decoded).toHaveProperty('id', testUser.id);
      expect(decoded).toHaveProperty('email', testUser.email);

      authToken = response.body.token;
    });

    test('should handle login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });
  });

  describe('JWT Token Validation and Expiration', () => {
    test('should reject expired JWT token', async () => {
      const expiredToken = jwt.sign({ id: testUser.id, email: testUser.email }, JWT_SECRET, { expiresIn: '-1s' });

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Token expired');
    });

    test('should accept valid JWT token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).not.toBe(401);
      expect(response.body.message).toBe('Access granted');
    });
  });

  describe('Refresh Token Mechanism', () => {
    test('should issue refresh token upon authentication', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      expect(response.body).toHaveProperty('refreshToken');

      refreshToken = response.body.refreshToken;
    });

    test('should refresh JWT token using refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');

      // Verify the new token
      const newToken = response.body.token;
      const decoded = jwt.verify(newToken, JWT_SECRET);
      expect(decoded).toHaveProperty('id', testUser.id);
    });

    test('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-refresh-token' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Invalid refresh token');
    });

    test('should refresh tokens with valid existing refresh token in DB', async () => {
      // Simulate new login to generate refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      const validRefreshToken = loginResponse.body.refreshToken;

      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: validRefreshToken });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body).toHaveProperty('token');

      // Decode the refreshed token
      const refreshedToken = refreshResponse.body.token;
      const decoded = jwt.verify(refreshedToken, JWT_SECRET);
      expect(decoded).toHaveProperty('id', testUser.id);
    });

    test('should handle expired refresh token properly', async () => {
      // This test assumes refresh tokens have an expiry in your application
      const expiredRefreshToken = jwt.sign({ id: testUser.id }, JWT_SECRET, { expiresIn: '-1s' });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: expiredRefreshToken });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Refresh token expired');
    });
  });

  describe('Token Revocation and Logout', () => {
    test('should revoke refresh token on logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });
      
      expect(refreshResponse.status).toBe(403);
      expect(refreshResponse.body.error).toContain('Invalid refresh token');
    });

    test('should allow token reuse until logout', async () => {
      // Re-authenticate to get fresh token pair
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      const reusableToken = response.body.token;
      const reusableRefreshToken = response.body.refreshToken;

      // Use the tokens before logout
      const accessResponse = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${reusableToken}`);
      expect(accessResponse.status).toBe(200);

      // Log out
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${reusableToken}`);

      // Try to use refresh token post logout, should be invalidated
      const postLogoutResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: reusableRefreshToken });

      expect(postLogoutResponse.status).toBe(403);
    });
  });
});

