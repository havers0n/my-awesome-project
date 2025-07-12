import { Request, Response, NextFunction } from 'express';
import { User } from '@supabase/supabase-js';

// Мок для Express Request
export const mockRequest = (options: Partial<Request> = {}): Partial<Request> => ({
  headers: {},
  body: {},
  params: {},
  query: {},
  ...options,
});

// Мок для Express Response
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

// Мок для Express NextFunction
export const mockNext = (): NextFunction => jest.fn();

// Мок пользователя Supabase
export const mockSupabaseUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmation_sent_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  recovery_sent_at: '',
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {
    name: 'Test User'
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_anonymous: false,
  ...overrides,
});

// Мок для JWT токена
export const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MTYyMzkwMjJ9.test-signature';

// Хелпер для создания мокированного запроса с авторизацией
export const mockAuthenticatedRequest = (userId: string = 'test-user-id', options: Partial<Request> = {}): Partial<Request> => ({
  ...mockRequest(options),
  headers: {
    authorization: `Bearer ${mockJwtToken}`,
    ...options.headers,
  },
  user: {
    id: userId,
    email: 'test@example.com',
    role: 'user',
    authType: 'supabase' as const,
    organization_id: null,
    location_id: null,
  },
});

// Хелпер для ожидания асинхронных операций
export const waitForAsync = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Хелпер для тестирования ошибок
export const expectErrorResponse = (res: Partial<Response>, statusCode: number, errorMessage?: string) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  if (errorMessage) {
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining(errorMessage)
      })
    );
  }
};

// Хелпер для тестирования успешных ответов
export const expectSuccessResponse = (res: Partial<Response>, statusCode: number = 200, data?: any) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  if (data) {
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining(data)
    );
  }
};
