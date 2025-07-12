import request from 'supertest';
import nock from 'nock';
import { forecastInputSchema } from './schemas/forecastSchema';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock Supabase admin client before importing it
jest.mock('./supabaseAdminClient', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn()
  }
}));

// Mock dualAuthMiddleware
jest.mock('./middleware/dualAuthMiddleware', () => ({
  dualAuthenticateToken: jest.fn((req, res, next) => {
    // Set a test user on the request
    req.user = {
      id: 'test-user-id',
      email: 'danypetrov2002@gmail.com',
      role: 'user',
      authType: 'supabase',
      organization_id: 1,
      location_id: 1
    };
    next();
  })
}));

// Mock getSupabaseUserClient
jest.mock('./supabaseUserClient', () => ({
  getSupabaseUserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { 
          user: { 
            id: 'test-user-id',
            email: 'danypetrov2002@gmail.com'
          } 
        },
        error: null
      })
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { organization_id: 1 }, 
        error: null 
      })
    }))
  }))
}));

// Now import app and supabaseAdmin after all mocks are set up
import app from './app';
import { supabaseAdmin } from './supabaseAdminClient';

// The controller now expects only DaysCount, not the full payload
const validPayload = { DaysCount: 5 };

const mlResponse = [
  { MAPE: 10, MAE: 0.5, DaysPredict: 5 },
  {
    Период: '2025-06-01 - 2025-06-05',
    Номенклатура: 'TEST001',  // Match the product ID
    Код: 'TEST001',
    MAPE: 10,
    MAE: 0.5,
    Количество: 5,
  }
];

describe('POST /api/forecast', () => {
  // Set ML_SERVICE_URL for tests
  const originalMLServiceURL = process.env.ML_SERVICE_URL;
  
  beforeAll(() => {
    process.env.ML_SERVICE_URL = 'http://localhost:8000/predict';
  });
  
  afterAll(() => {
    if (originalMLServiceURL !== undefined) {
      process.env.ML_SERVICE_URL = originalMLServiceURL;
    } else {
      delete process.env.ML_SERVICE_URL;
    }
  });
  
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

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Supabase auth.getUser to return test user
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: testUser },
      error: null
    });

    // Mock Supabase from('users').select() chain
    const mockUsersChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: testProfile, error: null })
    };

    // Mock Supabase from('locations').select() chain
    const mockLocationsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: testLocation, error: null })
    };

    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'users') return mockUsersChain;
      if (table === 'locations') return mockLocationsChain;
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      };
    });
    
    // Mock getSupabaseUserClient to return operations data
    const { getSupabaseUserClient } = require('./supabaseUserClient');
    getSupabaseUserClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { 
            user: { 
              id: 'test-user-id',
              email: 'danypetrov2002@gmail.com'
            } 
          },
          error: null
        })
      },
      from: jest.fn((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: { organization_id: 1 }, 
              error: null 
            })
          };
        }
        if (table === 'operations') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ 
              data: [
                {
                  product_id: 'TEST001',
                  operation_type: 'sale',
                  quantity: 10,
                  operation_date: '2025-07-11',
                  cost_price: 100
                }
              ], 
              error: null 
            })
          };
        }
        if (table === 'products') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ 
              data: [
                {
                  id: 'TEST001',
                  name: 'Test Product 1',
                  code: 'TP1'
                }
              ], 
              error: null 
            })
          };
        }
        if (table === 'prediction_runs') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ 
              data: { id: 'prediction-run-id' }, 
              error: null 
            })
          };
        }
        if (table === 'predictions') {
          return {
            insert: jest.fn().mockResolvedValue({ 
              data: [], 
              error: null 
            })
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null })
        };
      })
    });
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  it('validates input and proxies to ML, stores and returns canonical JSON', async () => {
    // Мокируем axios непосредственно перед тестом
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post = jest.fn().mockResolvedValue({ data: mlResponse });
    
    const res = await request(app)
      .post('/api/forecast/predict')
      .send(validPayload)
      .set('Authorization', 'Bearer testtoken');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mlResponse);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('MAPE');
    expect(res.body[1]).toHaveProperty('Номенклатура');
    
    // Verify axios was called with correct parameters
    expect(mockedAxios.post).toHaveBeenCalled();
    const [url, payload] = mockedAxios.post.mock.calls[0];
    
    // The URL might be from environment variable or default
    expect(url).toMatch(/^http:\/\/localhost:(5000|8000)/);  
    
    expect(payload).toEqual(expect.objectContaining({
      DaysCount: 5,
      events: expect.arrayContaining([
        expect.objectContaining({
          Type: 'Продажа',
          Период: '2025-07-11',
          Номенклатура: 'TEST001'
        })
      ])
    }));
  });

  it('returns 400 on invalid input', async () => {
    const invalidPayload = { DaysCount: 'not a number' }; // invalid type
    const res = await request(app)
      .post('/api/forecast/predict')
      .send(invalidPayload)
      .set('Authorization', 'Bearer testtoken');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 if authorization header is missing', async () => {
    const res = await request(app)
      .post('/api/forecast/predict')
      .send(validPayload);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Отсутствует заголовок Authorization');
  });

  it('returns 502 if ML service errors', async () => {
    // Override the default mock to throw error
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post = jest.fn().mockRejectedValueOnce(new Error('upstream fail'));
    
    const res = await request(app)
      .post('/api/forecast/predict')
      .send(validPayload)
      .set('Authorization', 'Bearer testtoken');
    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
  });
});

