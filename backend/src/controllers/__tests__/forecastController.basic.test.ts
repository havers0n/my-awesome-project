import { Request, Response } from 'express';
import { predictSales, getForecastData, getForecastHistory } from '../forecastController';
import * as supabaseUserClient from '../../supabaseUserClient';

// Mock all dependencies
jest.mock('../../supabaseUserClient');
jest.mock('axios');
jest.mock('../../utils/mlPayloadFormatter');
jest.mock('../../utils/errorHandling');
jest.mock('../../utils/dataValidation');
jest.mock('../../schemas/forecastSchema');

describe('ForecastController - Basic Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockReq = {
      headers: { authorization: 'Bearer test-token' },
      body: { DaysCount: 7 },
      user: { id: 'test-user-id', email: 'test@example.com', organization_id: 1, authType: 'supabase', location_id: 1 }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Create a simple mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          error: null
        })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Профиль не найден' }
      }),
      order: jest.fn().mockReturnThis()
    };

    (supabaseUserClient.getSupabaseUserClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('predictSales', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockReq.user = undefined;

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should return 401 when authorization header is missing', async () => {
      mockReq.headers = {};

      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Отсутствует заголовок Authorization' });
    });

    it('should return 400 when user profile is not found', async () => {
      // The default mock already returns profile not found error
      await predictSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Не удалось получить данные профиля пользователя',
        details: 'Профиль не найден'
      });
    });
  });

  describe('getForecastData', () => {
    it('should return 401 when authorization header is missing', async () => {
      mockReq.headers = {};

      await getForecastData(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Требуется аутентификация' });
    });

    it('should return mock data when USE_MOCK_ML is true', async () => {
      process.env.USE_MOCK_ML = 'true';
      mockReq.user = { id: 'test-user', email: 'test@example.com', organization_id: 1, authType: 'supabase', location_id: 1 };

      await getForecastData(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          trend: expect.any(Object),
          topProducts: expect.any(Array),
          history: expect.any(Object)
        })
      );

      delete process.env.USE_MOCK_ML;
    });
  });

  describe('getForecastHistory', () => {
    it('should return 401 when authorization header is missing', async () => {
      mockReq.headers = {};

      await getForecastHistory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Требуется аутентификация' });
    });
  });
});
