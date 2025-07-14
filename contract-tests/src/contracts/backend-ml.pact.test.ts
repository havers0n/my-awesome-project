import { Pact } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';
import { 
  mlForecastRequestSchema,
  mlForecastResponseSchema,
  mlHealthCheckResponseSchema,
  mlModelInfoResponseSchema
} from '../schemas/ml-api.schema';

describe('Backend-ML Service Contract Tests', () => {
  const provider = new Pact({
    consumer: 'Backend',
    provider: 'ML-Service',
    port: 8082,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'info',
    spec: 2
  });

  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('Forecast API', () => {
    test('POST /forecast', async () => {
      const requestBody = [
        {
          DaysCount: 7
        },
        {
          Type: 'Продажа',
          Период: '2024-01-01',
          Номенклатура: 'Товар 1',
          Код: 'T001',
          Количество: 10,
          Сумма: 1000,
          Цена_на_полке: 100,
          StoreId: 1
        },
        {
          Type: 'Поставка',
          Период: '2024-01-02',
          Номенклатура: 'Товар 1',
          Код: 'T001',
          Количество: 50,
          Цена: 80
        }
      ];

      const expectedResponse = {
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
          },
          {
            Период: '2024-01-09',
            Номенклатура: 'Товар 1',
            Код: 'T001',
            MAPE: 11.8,
            MAE: 2.1,
            Количество: 12
          }
        ]
      };

      // Validate request and response schemas
      expect(mlForecastRequestSchema.validate(requestBody).error).toBeUndefined();
      expect(mlForecastResponseSchema.validate(expectedResponse).error).toBeUndefined();

      await provider.addInteraction({
        state: 'ML model is loaded',
        uponReceiving: 'a forecast request from backend',
        withRequest: {
          method: 'POST',
          path: '/forecast',
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
        `http://localhost:${provider.opts.port}/forecast`,
        requestBody,
        { headers: { 'Content-Type': 'application/json' } }
      );

      expect(response.data).toEqual(expectedResponse);
    });

    test('POST /forecast with invalid data returns error', async () => {
      const invalidRequestBody = [
        {
          DaysCount: 0 // Invalid: should be minimum 1
        }
      ];

      const errorResponse = {
        error: 'Invalid request',
        message: 'DaysCount must be between 1 and 365'
      };

      await provider.addInteraction({
        state: 'ML model is loaded',
        uponReceiving: 'an invalid forecast request',
        withRequest: {
          method: 'POST',
          path: '/forecast',
          headers: {
            'Content-Type': 'application/json'
          },
          body: invalidRequestBody
        },
        willRespondWith: {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          },
          body: errorResponse
        }
      });

      try {
        await axios.post(
          `http://localhost:${provider.opts.port}/forecast`,
          invalidRequestBody,
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual(errorResponse);
      }
    });
  });

  describe('Health Check API', () => {
    test('GET /health', async () => {
      const expectedResponse = {
        status: 'ok',
        model_loaded: true,
        version: '1.0.0'
      };

      // Validate schema
      expect(mlHealthCheckResponseSchema.validate(expectedResponse).error).toBeUndefined();

      await provider.addInteraction({
        state: 'ML service is running',
        uponReceiving: 'a health check request',
        withRequest: {
          method: 'GET',
          path: '/health'
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
        `http://localhost:${provider.opts.port}/health`
      );

      expect(response.data).toEqual(expectedResponse);
    });
  });

  describe('Model Info API', () => {
    test('GET /model/info', async () => {
      const expectedResponse = {
        model_type: 'RandomForest',
        version: '1.0.0',
        features: [
          'ItemName_Enc',
          'Месяц',
          'ДеньМесяца',
          'ДеньНедели',
          'Квартал',
          'IsHoliday_Impact',
          'Sales_Avg_7',
          'Sales_Avg_14',
          'Sales_Avg_30',
          'Sales_Std_7',
          'Sales_Lag_1',
          'Sales_Lag_7',
          'Sales_vs_7d_avg',
          'PricePerUnit',
          'month_sin',
          'month_cos',
          'day_sin',
          'day_cos'
        ],
        training_date: '2024-01-01T00:00:00Z',
        metrics: {
          mape: 12.5,
          mae: 2.3,
          rmse: 3.1
        }
      };

      // Validate schema
      expect(mlModelInfoResponseSchema.validate(expectedResponse).error).toBeUndefined();

      await provider.addInteraction({
        state: 'ML model is loaded',
        uponReceiving: 'a model info request',
        withRequest: {
          method: 'GET',
          path: '/model/info'
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
        `http://localhost:${provider.opts.port}/model/info`
      );

      expect(response.data).toEqual(expectedResponse);
    });
  });
});
