import { Request, Response, NextFunction } from 'express';
import { dualAuthenticateToken } from '../dualAuthMiddleware';
import { supabaseAdmin } from '../../supabaseAdminClient';
import { pool } from '../../db';
import jwt from 'jsonwebtoken';

jest.mock('../../supabaseAdminClient', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

jest.mock('../../db', () => ({
  pool: {
    query: jest.fn()
  }
}));

jest.mock('jsonwebtoken');

describe('dualAuthenticateToken', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      cookies: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate user with valid Supabase token', async () => {
    mockReq.headers = { authorization: 'Bearer valid-supabase-token' };
    
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { organization_id: 'org-123' }
    };

    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    (pool.query as jest.Mock).mockResolvedValue({
      rows: [{
        id: 'user-123',
        organization_id: 'org-123',
        role: 'admin'
      }]
    });

    await dualAuthenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      role: 'admin',
      authType: 'supabase',
      organization_id: null,
      location_id: undefined
    });
  });

  it('should authenticate user with valid JWT token in header', async () => {
    mockReq.headers = { authorization: 'Bearer valid-jwt-token' };
    
    // Mock Supabase to fail first
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' }
    });
    
    const mockPayload = {
      id: 'user-123',
      email: 'test@example.com',
      organization_id: 'org-123',
      role: 'user'
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
    
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [{
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        organization_id: 'org-123'
      }]
    });

    await dualAuthenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      role: 'user',
      authType: 'legacy',
      organization_id: 'org-123',
      location_id: null
    });
  });

  it('should return 401 when no token is provided', async () => {
    await dualAuthenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token required' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 when Supabase token is invalid', async () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };
    
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' }
    });

    // Mock JWT verify to throw error
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await dualAuthenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 when JWT token is invalid', async () => {
    mockReq.headers = { authorization: 'Bearer invalid-jwt-token' };
    
    // Mock Supabase to fail
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' }
    });
    
    // Mock JWT verify to throw
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    await dualAuthenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    mockReq.headers = { authorization: 'Bearer valid-supabase-token' };
    
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com'
    };

    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    // First query (user_profiles) throws error
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    await dualAuthenticateToken(mockReq as Request, mockRes as Response, mockNext);

    // The middleware still continues with default values when profile fetch fails
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      role: 'employee', // default role
      authType: 'supabase',
      organization_id: null,
      location_id: null
    });
  });
});
