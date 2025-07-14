# Примеры тестов для новых features

## 1. Тестирование REST API endpoint

```typescript
import request from 'supertest';
import app from '../../app';

describe('POST /api/forecast', () => {
  test('should return forecast for valid data', async () => {
    const forecastData = {
      organizationId: '123',
      dataPoints: [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 120 }
      ],
      horizon: 7
    };

    const response = await request(app)
      .post('/api/forecast')
      .set('Authorization', 'Bearer valid-token')
      .send(forecastData)
      .expect(200);

    expect(response.body).toHaveProperty('forecast');
    expect(response.body.forecast).toHaveLength(7);
  });

  test('should return 400 for invalid data', async () => {
    const response = await request(app)
      .post('/api/forecast')
      .set('Authorization', 'Bearer valid-token')
      .send({ invalidField: 'test' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
```

## 2. Тестирование сервиса с внешними зависимостями

```typescript
import { ForecastService } from '../../services/ForecastService';
import { MLClient } from '../../clients/MLClient';

jest.mock('../../clients/MLClient');

describe('ForecastService', () => {
  let forecastService: ForecastService;
  let mockMLClient: jest.Mocked<MLClient>;

  beforeEach(() => {
    mockMLClient = new MLClient() as jest.Mocked<MLClient>;
    forecastService = new ForecastService(mockMLClient);
  });

  test('should process forecast request', async () => {
    const mockPrediction = { values: [150, 160, 170] };
    mockMLClient.predict.mockResolvedValue(mockPrediction);

    const result = await forecastService.generateForecast({
      data: [100, 120, 130],
      horizon: 3
    });

    expect(mockMLClient.predict).toHaveBeenCalledWith({
      data: [100, 120, 130],
      horizon: 3
    });
    expect(result).toEqual(mockPrediction);
  });

  test('should handle ML service error', async () => {
    mockMLClient.predict.mockRejectedValue(new Error('ML Service unavailable'));

    await expect(
      forecastService.generateForecast({ data: [], horizon: 3 })
    ).rejects.toThrow('ML Service unavailable');
  });
});
```

## 3. Тестирование middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { verifyToken } from '../../utils/jwt';

jest.mock('../../utils/jwt');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('should pass valid token', async () => {
    mockRequest = {
      headers: {
        authorization: 'Bearer valid-token'
      }
    };

    (verifyToken as jest.Mock).mockResolvedValue({ userId: '123' });

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toEqual({ userId: '123' });
  });

  test('should reject missing token', async () => {
    mockRequest = {
      headers: {}
    };

    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'No token provided'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
```

## 4. Тестирование валидации данных

```typescript
import { validateForecastInput } from '../../validators/forecast';

describe('Forecast Input Validation', () => {
  test('should accept valid input', () => {
    const input = {
      dataPoints: [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 120 }
      ],
      horizon: 7,
      method: 'arima'
    };

    const result = validateForecastInput(input);
    expect(result.isValid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  test('should reject empty data points', () => {
    const input = {
      dataPoints: [],
      horizon: 7
    };

    const result = validateForecastInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Data points cannot be empty');
  });

  test('should reject invalid horizon', () => {
    const input = {
      dataPoints: [{ date: '2024-01-01', value: 100 }],
      horizon: -1
    };

    const result = validateForecastInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Horizon must be positive');
  });
});
```

## 5. Тестирование базы данных (интеграционный тест)

```typescript
import { UserRepository } from '../../repositories/UserRepository';
import { testDb } from '../setup/testDatabase';

describe('UserRepository Integration', () => {
  let userRepo: UserRepository;

  beforeAll(async () => {
    await testDb.connect();
    userRepo = new UserRepository(testDb);
  });

  afterAll(async () => {
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clear();
  });

  test('should create and retrieve user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      organizationId: '123'
    };

    const created = await userRepo.create(userData);
    expect(created.id).toBeDefined();

    const retrieved = await userRepo.findById(created.id);
    expect(retrieved).toMatchObject(userData);
  });

  test('should handle duplicate email', async () => {
    const userData = {
      email: 'duplicate@example.com',
      name: 'Test User'
    };

    await userRepo.create(userData);
    
    await expect(userRepo.create(userData))
      .rejects.toThrow('Email already exists');
  });
});
```

## 6. Тестирование React компонента (если есть frontend)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ForecastForm } from '../../components/ForecastForm';

describe('ForecastForm', () => {
  test('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    
    render(<ForecastForm onSubmit={onSubmit} />);
    
    const fileInput = screen.getByLabelText('Upload CSV');
    const horizonInput = screen.getByLabelText('Forecast Horizon');
    const submitButton = screen.getByText('Generate Forecast');

    fireEvent.change(fileInput, {
      target: { files: [new File([''], 'data.csv')] }
    });
    fireEvent.change(horizonInput, { target: { value: '7' } });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      file: expect.any(File),
      horizon: 7
    });
  });
});
```
