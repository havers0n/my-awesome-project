import { Request, Response } from 'express';
import { resetPassword, getProfile } from '../authController';
import { supabaseAdmin } from '../../supabaseAdminClient';
import { 
  mockRequest, 
  mockResponse, 
  expectErrorResponse, 
  expectSuccessResponse 
} from '../../__tests__/helpers/testHelpers';

// Мокаем supabaseAdminClient
jest.mock('../../supabaseAdminClient', () => ({
  supabaseAdmin: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('resetPassword', () => {
    it('должен отправить email для сброса пароля', async () => {
      req.body = { email: 'test@example.com' };
      const mockData = { success: true };
      
      (supabaseAdmin.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      await resetPassword(req as Request, res as Response);

      expect(supabaseAdmin.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent',
        data: mockData,
      });
    });

    it('должен вернуть ошибку если email не предоставлен', async () => {
      req.body = {};

      await resetPassword(req as Request, res as Response);

      expectErrorResponse(res, 400, 'Email is required');
      expect(supabaseAdmin.auth.resetPasswordForEmail).not.toHaveBeenCalled();
    });

    it('должен вернуть ошибку если Supabase вернул ошибку', async () => {
      req.body = { email: 'test@example.com' };
      const mockError = { message: 'User not found' };
      
      (supabaseAdmin.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      await resetPassword(req as Request, res as Response);

      expectErrorResponse(res, 400, 'User not found');
    });

    it('должен обработать неожиданную ошибку', async () => {
      req.body = { email: 'test@example.com' };
      
      (supabaseAdmin.auth.resetPasswordForEmail as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await resetPassword(req as Request, res as Response);

      expectErrorResponse(res, 500, 'Network error');
    });
  });

  describe('getProfile', () => {
    it('должен вернуть профиль пользователя если аутентифицирован', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        authType: 'supabase' as const,
        organization_id: null,
        location_id: null,
      };
      req.user = mockUser;

      getProfile(req as Request, res as Response);

      expectSuccessResponse(res, 200, mockUser);
    });

    it('должен вернуть 401 если пользователь не аутентифицирован', () => {
      req.user = undefined;

      getProfile(req as Request, res as Response);

      expectErrorResponse(res, 401, 'Not authenticated');
    });
  });
});
