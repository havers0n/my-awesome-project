import { Request, Response, NextFunction } from 'express';
import { authenticateSupabaseToken } from '../supabaseAuthMiddleware';
import { supabaseAdmin } from '../../supabaseAdminClient';
import { 
  mockRequest, 
  mockResponse, 
  mockNext,
  mockSupabaseUser,
  expectErrorResponse 
} from '../../__tests__/helpers/testHelpers';

// Мокаем supabaseAdminClient
jest.mock('../../supabaseAdminClient', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Мокаем console.log для чистоты тестов
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('supabaseAuthMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    jest.clearAllMocks();
  });

  describe('authenticateSupabaseToken', () => {
    it('должен пропустить запрос с валидным токеном', async () => {
      // Настраиваем мок данные
      const mockUser = mockSupabaseUser();
      const mockProfile = {
        role: 'admin',
        location_id: 1,
      };
      const mockLocation = {
        organization_id: 100,
      };

      req.headers = { authorization: 'Bearer valid-token' };

      // Мокаем Supabase запросы
      (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
      (supabaseAdmin.from as jest.Mock).mockReturnValue(fromMock);
      
      // Первый вызов для users таблицы
      fromMock.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });
      
      // Второй вызов для locations таблицы
      fromMock.single.mockResolvedValueOnce({
        data: mockLocation,
        error: null,
      });

      await authenticateSupabaseToken(req as Request, res as Response, next);

      // Проверяем что пользователь установлен в req
      expect(req.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: 'admin',
        authType: 'supabase',
        location_id: 1,
        organization_id: 100,
      });

      // Проверяем что next() был вызван
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('должен вернуть 401 если нет заголовка авторизации', async () => {
      req.headers = {};

      await authenticateSupabaseToken(req as Request, res as Response, next);

      expectErrorResponse(res, 401, 'No token provided');
      expect(next).not.toHaveBeenCalled();
    });

    it('должен вернуть 401 если заголовок авторизации неверного формата', async () => {
      req.headers = { authorization: 'InvalidFormat token' };

      await authenticateSupabaseToken(req as Request, res as Response, next);

      expectErrorResponse(res, 401, 'No token provided');
      expect(next).not.toHaveBeenCalled();
    });

    it('должен вернуть 401 если токен невалидный', async () => {
      req.headers = { authorization: 'Bearer invalid-token' };

      (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' },
      });

      await authenticateSupabaseToken(req as Request, res as Response, next);

      expectErrorResponse(res, 401, 'Invalid token');
      expect(next).not.toHaveBeenCalled();
    });

    it('должен вернуть 403 если профиль пользователя не найден', async () => {
      const mockUser = mockSupabaseUser();
      req.headers = { authorization: 'Bearer valid-token' };

      (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' },
        }),
      };
      (supabaseAdmin.from as jest.Mock).mockReturnValue(fromMock);

      await authenticateSupabaseToken(req as Request, res as Response, next);

      expectErrorResponse(res, 403, 'User profile not found');
      expect(next).not.toHaveBeenCalled();
    });

    it('должен обработать случай когда у пользователя нет location_id', async () => {
      const mockUser = mockSupabaseUser();
      const mockProfile = {
        role: 'user',
        location_id: null,
      };

      req.headers = { authorization: 'Bearer valid-token' };

      (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };
      (supabaseAdmin.from as jest.Mock).mockReturnValue(fromMock);

      await authenticateSupabaseToken(req as Request, res as Response, next);

      expect(req.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: 'user',
        authType: 'supabase',
        location_id: null,
        organization_id: null,
      });
      expect(next).toHaveBeenCalled();
    });

    it('должен обработать ошибку при получении location', async () => {
      const mockUser = mockSupabaseUser();
      const mockProfile = {
        role: 'admin',
        location_id: 1,
      };

      req.headers = { authorization: 'Bearer valid-token' };

      (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const fromMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
      (supabaseAdmin.from as jest.Mock).mockReturnValue(fromMock);
      
      // Первый вызов для users таблицы успешный
      fromMock.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });
      
      // Второй вызов для locations таблицы с ошибкой
      fromMock.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Location not found' },
      });

      await authenticateSupabaseToken(req as Request, res as Response, next);

      // Должен продолжить без organization_id
      expect(req.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: 'admin',
        authType: 'supabase',
        location_id: 1,
        organization_id: null,
      });
      expect(next).toHaveBeenCalled();
    });

    it('должен вернуть 500 при неожиданной ошибке', async () => {
      req.headers = { authorization: 'Bearer valid-token' };

      (supabaseAdmin.auth.getUser as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await authenticateSupabaseToken(req as Request, res as Response, next);

      expectErrorResponse(res, 500, 'Authentication failed');
      expect(next).not.toHaveBeenCalled();
    });
  });
});
