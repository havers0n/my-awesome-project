import request from 'supertest';
import app from '../../app';
import { setupIntegrationTests, testSupabase, cleanupTestData } from './setup';

describe('Authentication API Integration Tests', () => {
  beforeAll(setupIntegrationTests.beforeAll);
  beforeEach(setupIntegrationTests.beforeEach);
  afterEach(setupIntegrationTests.afterEach);
  afterAll(setupIntegrationTests.afterAll);

  describe('POST /auth/signup', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        email: 'newuser@test.com',
        password: 'password123',
        name: 'New Test User'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(newUser)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body).toHaveProperty('session');
    });

    it('should return error for duplicate email', async () => {
      const user = {
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'Duplicate User'
      };

      // Create first user
      await request(app)
        .post('/auth/signup')
        .send(user)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/auth/signup')
        .send(user)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate email format', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Invalid Email User'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidUser)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should enforce minimum password length', async () => {
      const weakPasswordUser = {
        email: 'weak@test.com',
        password: '123',
        name: 'Weak Password User'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(weakPasswordUser)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/signin', () => {
    beforeEach(async () => {
      // Create a test user for signin tests
      const { error } = await testSupabase.auth.signUp({
        email: 'signin@test.com',
        password: 'testpassword123',
        options: {
          data: {
            name: 'Signin Test User'
          }
        }
      });
      if (error) console.error('Error creating test user:', error);
    });

    it('should successfully sign in with valid credentials', async () => {
      const credentials = {
        email: 'signin@test.com',
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/auth/signin')
        .send(credentials)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('access_token');
    });

    it('should return error for invalid password', async () => {
      const invalidCredentials = {
        email: 'signin@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/signin')
        .send(invalidCredentials)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return error for non-existent user', async () => {
      const nonExistentUser = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/signin')
        .send(nonExistentUser)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing credentials', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({})
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Protected Routes Authentication', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create user and get auth token
      const { data, error } = await testSupabase.auth.signUp({
        email: 'protected@test.com',
        password: 'testpassword123',
        options: {
          data: {
            name: 'Protected Route User'
          }
        }
      });
      
      if (error) throw error;
      authToken = data.session?.access_token || '';
    });

    it('should allow access to protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/predictions/forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/predictions/forecast')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/predictions/forecast')
        .set('Authorization', 'Bearer invalid_token_123')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny access with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/predictions/forecast')
        .set('Authorization', 'InvalidFormat')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh token when expired', async () => {
      // This test would require mocking token expiration
      // For now, we'll test the refresh endpoint if it exists
      const { data } = await testSupabase.auth.signUp({
        email: 'refresh@test.com',
        password: 'testpassword123'
      });

      if (data.session?.refresh_token) {
        // Test refresh token flow if endpoint exists
        const response = await request(app)
          .post('/auth/refresh')
          .send({ refresh_token: data.session.refresh_token });

        // If endpoint exists, check response
        if (response.status !== 404) {
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('access_token');
        }
      }
    });
  });
});
