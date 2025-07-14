import { DocumentationGenerator } from './utils/doc-generator';
import * as backendSchemas from './schemas/backend-api.schema';
import * as mlSchemas from './schemas/ml-api.schema';
import path from 'path';
import fs from 'fs';

const generator = new DocumentationGenerator();

// Backend API Documentation
generator.addService({
  service: 'Backend API',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api',
  endpoints: [
    {
      method: 'POST',
      path: '/auth/login',
      description: 'Authenticate user and receive JWT token',
      requestSchema: backendSchemas.loginRequestSchema,
      responseSchema: backendSchemas.loginResponseSchema,
      examples: {
        request: {
          email: 'user@example.com',
          password: 'password123'
        },
        response: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'user'
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/register',
      description: 'Register a new user',
      requestSchema: backendSchemas.registerRequestSchema,
      responseSchema: backendSchemas.loginResponseSchema,
      examples: {
        request: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        }
      }
    },
    {
      method: 'POST',
      path: '/forecast',
      description: 'Get sales forecast for specified products and date range',
      requestSchema: backendSchemas.forecastRequestSchema,
      responseSchema: backendSchemas.forecastResponseSchema,
      examples: {
        request: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T00:00:00Z',
          products: ['product-1', 'product-2'],
          storeId: 1
        },
        response: {
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
        }
      }
    },
    {
      method: 'GET',
      path: '/inventory',
      description: 'Get paginated list of inventory items',
      responseSchema: backendSchemas.inventoryListResponseSchema,
      examples: {
        response: {
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
        }
      }
    },
    {
      method: 'POST',
      path: '/upload',
      description: 'Upload data file (inventory, sales, or forecast)',
      requestSchema: backendSchemas.uploadRequestSchema,
      responseSchema: backendSchemas.uploadResponseSchema
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Health check endpoint',
      responseSchema: backendSchemas.healthCheckResponseSchema,
      examples: {
        response: {
          status: 'healthy',
          version: '1.0.0',
          timestamp: '2024-01-01T00:00:00Z',
          services: {
            database: true,
            mlService: true,
            cache: true
          }
        }
      }
    }
  ]
});

// ML Service API Documentation
generator.addService({
  service: 'ML Service API',
  version: '1.0.0',
  baseUrl: 'http://localhost:8000',
  endpoints: [
    {
      method: 'POST',
      path: '/forecast',
      description: 'Generate sales forecast based on historical data',
      requestSchema: mlSchemas.mlForecastRequestSchema,
      responseSchema: mlSchemas.mlForecastResponseSchema,
      examples: {
        request: [
          {
            DaysCount: 7
          },
          {
            Type: 'Продажа',
            Период: '2024-01-01',
            Номенклатура: 'Товар 1',
            Код: 'T001',
            Количество: 10,
            Сумма: 1000
          }
        ],
        response: {
          metric: {
            DaysPredict: 7
          },
          detail: [
            {
              Период: '2024-01-08',
              Номенклатура: 'Товар 1',
              Код: 'T001',
              MAPE: 12.5,
              MAE: 2.3,
              Количество: 15
            }
          ]
        }
      }
    },
    {
      method: 'GET',
      path: '/health',
      description: 'ML service health check',
      responseSchema: mlSchemas.mlHealthCheckResponseSchema,
      examples: {
        response: {
          status: 'ok',
          model_loaded: true,
          version: '1.0.0'
        }
      }
    },
    {
      method: 'GET',
      path: '/model/info',
      description: 'Get information about the loaded ML model',
      responseSchema: mlSchemas.mlModelInfoResponseSchema,
      examples: {
        response: {
          model_type: 'RandomForest',
          version: '1.0.0',
          features: ['ItemName_Enc', 'Месяц', 'ДеньМесяца'],
          training_date: '2024-01-01T00:00:00Z',
          metrics: {
            mape: 12.5,
            mae: 2.3,
            rmse: 3.1
          }
        }
      }
    }
  ]
});

// Create output directory if it doesn't exist
const outputDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate and save documentation
generator.saveDocumentation(outputDir);

console.log('Documentation generation complete!');
