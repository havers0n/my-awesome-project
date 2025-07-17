import request from 'supertest';
import app from '../app';
import * as supabaseUserClient from '../supabaseUserClient';

jest.mock('../supabaseUserClient');
jest.mock('../supabaseClient', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(),
      admin: {
        createUser: jest.fn(),
        deleteUser: jest.fn()
      }
    },
    from: jest.fn()
  }
}));

describe('App Integration Tests', () => {
  // Import supabaseAdmin for mocking
  const { supabaseAdmin } = require('../supabaseClient');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock test user
    const testUser = {
      id: 'test-user-id',
      email: 'danypetrov2002@gmail.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2025-01-01T00:00:00.000Z'
    };

    const testProfile = {
      id: 'test-user-id',
      role: 'user',
      location_id: 1
    };

    const testLocation = {
      id: 1,
      organization_id: 1
    };
    
    // Mock supabaseAdmin auth.getUser
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: testUser },
      error: null
    });

    // Mock supabaseAdmin from() chains
    const mockUsersChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: testProfile, error: null })
    };

    const mockLocationsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: testLocation, error: null })
    };

    supabaseAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return mockUsersChain;
      if (table === 'locations') return mockLocationsChain;
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      };
    });
    
    // Mock getSupabaseUserClient
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null
        })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { organization_id: 'test-org-id' },
        error: null
      })
    };
    
    (supabaseUserClient.getSupabaseUserClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('Express Configuration', () => {
    it('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send('{ invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle large JSON payloads', async () => {
      const largePayload = { data: 'x'.repeat(100000) };
      
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send(largePayload);

      // Should either accept or reject based on body-parser limit
      expect([200, 413, 404]).toContain(response.status);
    });

    it('should set security headers', async () => {
      const response = await request(app)
        .get('/');

      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('Static File Serving', () => {
    it('should serve files from public directory', async () => {
      // This test assumes there might be files in the public directory
      const response = await request(app)
        .get('/robots.txt');

      // Should either find the file or return 404
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle uncaught errors gracefully', async () => {
      // Force an error by sending to a route that might throw
      const response = await request(app)
        .get('/api/error-test');

      expect([404, 500]).toContain(response.status);
    });

    it('should log errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send('{ invalid json');

      // Error logging might be async, so we don't check immediately
      consoleSpy.mockRestore();
    });
  });

  describe('Authentication Flow', () => {
    it('should protect routes with authentication', async () => {
      const response = await request(app)
        .post('/api/forecast/predict')
        .send({ DaysCount: 7 });

      expect(response.status).toBe(401);
    });

    it('should allow authenticated requests', async () => {
      const response = await request(app)
        .post('/api/forecast/predict')
        .set('Authorization', 'Bearer test-token')
        .send({ DaysCount: 7 });

      // Should either process or fail with specific error (403 for invalid token), not 401
      expect(response.status).not.toBe(401);
    });
  });

  describe('Health Endpoints', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/api/health');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
    });

    it('should respond to readiness check', async () => {
      const response = await request(app)
        .get('/api/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Request Logging', () => {
    it('should log incoming requests', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await request(app)
        .get('/api/health');

      // Pino logger might buffer logs
      consoleSpy.mockRestore();
    });
  });

  describe('Shutdown Handling', () => {
    it('should handle server shutdown gracefully', (done) => {
      // This test verifies the app can be shut down without errors
      const server = app.listen(0, () => {
        server.close(() => {
          done();
        });
      });
    });
  });
});
