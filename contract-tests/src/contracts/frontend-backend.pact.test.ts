import { Pact } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';
import { 
  loginRequestSchema, 
  loginResponseSchema,
  forecastRequestSchema,
  forecastResponseSchema,
  inventoryListResponseSchema,
  healthCheckResponseSchema
} from '../schemas/backend-api.schema';

describe('Frontend-Backend Contract Tests', () => {
  const provider = new Pact({
    consumer: 'Frontend',
    provider: 'Backend',
    port: 8081,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    spec: 2
  });

  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('Authentication API', () => {
    test('POST /api/auth/login', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'password123'
      };

      const expectedResponse = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'user'
        }
      };

      // Validate request and response schemas
      expect(loginRequestSchema.validate(requestBody).error).toBeUndefined();
      expect(loginResponseSchema.validate(expectedResponse).error).toBeUndefined();

      await provider.addInteraction({
        state: 'user exists',
        uponReceiving: 'a login request',
        withRequest: {
          method: 'POST',
          path: '/api/auth/login',
          headers: {
            'Content-Type': 'application/json'
          },
          body: requestBody
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: expectedResponse
        }
      });

      const response = await axios.post(
        `http://localhost:${provider.opts.port}/api/auth/login`,
        requestBody,
        { headers: { 'Content-Type': 'application/json' } }
      );

      expect(response.data).toEqual(expectedResponse);
    });
  });

  describe('Forecast API', () => {
    test('POST /api/forecast', async () => {
      const requestBody = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T00:00:00Z',
        products: ['product-1', 'product-2'],
        storeId: 1
      };

      const expectedResponse = {
        predictions: [
          {
            date: '2024-01-01T00:00:00Z',
            productId: 'product-1',
            productName: 'Product 1',
            predictedQuantity: 100,
            confidence: 85.5,
            mape: 12.3,
            mae: 5.2
          }
        ],
        metadata: {
          generatedAt: '2024-01-01T00:00:00Z',
          modelVersion: '1.0.0',
          requestId: '550e8400-e29b-41d4-a716-446655440000'
        }
      };

      // Validate schemas
      expect(forecastRequestSchema.validate(requestBody).error).toBeUndefined();
      expect(forecastResponseSchema.validate(expectedResponse).error).toBeUndefined();

      await provider.addInteraction({
        state: 'forecast model is available',
        uponReceiving: 'a forecast request',
        withRequest: {
          method: 'POST',
          path: '/api/forecast',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token'
          },
          body: requestBody
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: expectedResponse
        }
      });

      const response = await axios.post(
        `http://localhost:${provider.opts.port}/api/forecast`,
        requestBody,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token' 
          } 
        }
      );

      expect(response.data).toEqual(expectedResponse);
    });
  });

  describe('Inventory API', () => {
    test('GET /api/inventory', async () => {
      const expectedResponse = {
        items: [
          {
            id: 'item-1',
            name: 'Product 1',
            code: 'P001',
            quantity: 100,
            price: 50.99,
            category: 'Electronics',
            supplier: 'Supplier A',
            lastUpdated: '2024-01-01T00:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      };

      // Validate schema
      expect(inventoryListResponseSchema.validate(expectedResponse).error).toBeUndefined();

      await provider.addInteraction({
        state: 'inventory exists',
        uponReceiving: 'a request for inventory list',
        withRequest: {
          method: 'GET',
          path: '/api/inventory',
          query: 'page=1&pageSize=10',
          headers: {
            'Authorization': 'Bearer token'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: expectedResponse
        }
      });

      const response = await axios.get(
        `http://localhost:${provider.opts.port}/api/inventory?page=1&pageSize=10`,
        { headers: { 'Authorization': 'Bearer token' } }
      );

      expect(response.data).toEqual(expectedResponse);
    });
  });

  describe('Health Check API', () => {
    test('GET /api/health', async () => {
      const expectedResponse = {
        status: 'healthy',
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00Z',
        services: {
          database: true,
          mlService: true,
          cache: true
        }
      };

      // Validate schema
      expect(healthCheckResponseSchema.validate(expectedResponse).error).toBeUndefined();

      await provider.addInteraction({
        state: 'system is healthy',
        uponReceiving: 'a health check request',
        withRequest: {
          method: 'GET',
          path: '/api/health'
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: expectedResponse
        }
      });

      const response = await axios.get(
        `http://localhost:${provider.opts.port}/api/health`
      );

      expect(response.data).toEqual(expectedResponse);
    });
  });
});
