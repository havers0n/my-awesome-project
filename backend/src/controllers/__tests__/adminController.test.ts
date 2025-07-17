import { Request, Response } from 'express';
import { createUser, checkEmail } from '../adminController';
import * as logger from '../../utils/logger';
import { supabaseAdmin } from '../../supabaseClient';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('../../utils/logger');
jest.mock('../../supabaseClient', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    auth: {
      admin: {
        createUser: jest.fn()
      }
    }
  }
}));
jest.mock('bcryptjs');
jest.mock('../../db', () => ({
  pool: {
    query: jest.fn()
  }
}));

const { pool } = require('../../db');

describe('AdminController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Setup mock request
    mockReq = {
      body: {},
      user: {
        id: 'admin-user-id'
      },
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent'
      }
    } as any;

    // Setup mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const validUserData = {
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
      full_name: 'Test User',
      organization_id: 'org-123',
      role: 'user',
      phone: '+1234567890',
      position: 'Developer'
    };

    beforeEach(() => {
      mockReq.body = { ...validUserData };
    });

    it('should successfully create a user with valid data', async () => {
      // Mock Supabase admin user creation
      const mockSupabaseUser = {
        id: 'user-123',
        email: validUserData.email,
        user_metadata: {
          full_name: validUserData.full_name,
          organization_id: validUserData.organization_id,
          role: validUserData.role
        }
      };

      (supabaseAdmin.auth.admin.createUser as jest.Mock) = jest.fn().mockResolvedValue({
        data: { user: mockSupabaseUser },
        error: null
      });

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Mock database insert
      const mockDbResult = {
        rows: [{
          id: 'db-user-123',
          email: validUserData.email,
          full_name: validUserData.full_name,
          role: validUserData.role,
          organization_id: validUserData.organization_id,
          created_at: new Date()
        }]
      };
      pool.query.mockResolvedValue(mockDbResult);

      await createUser(mockReq as Request, mockRes as Response);

      // Verify Supabase admin call
      expect(supabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith({
        email: validUserData.email,
        password: validUserData.password,
        email_confirm: true,
        user_metadata: {
          full_name: validUserData.full_name,
          organization_id: validUserData.organization_id,
          role: validUserData.role,
          phone: validUserData.phone,
          position: validUserData.position
        }
      });

      // Verify password hashing
      expect(bcrypt.hash).toHaveBeenCalledWith(validUserData.password, 10);

      // Verify database insert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [
          validUserData.organization_id,
          validUserData.email,
          'hashed-password',
          validUserData.full_name,
          validUserData.role
        ]
      );

      // Verify logging
      expect(logger.logAdminAction).toHaveBeenCalledWith('create_user', {
        adminId: 'admin-user-id',
        email: validUserData.email,
        organization_id: validUserData.organization_id,
        role: validUserData.role,
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      // Verify response
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Пользователь создан',
        user: mockSupabaseUser
      });
    });

    it('should return 400 when email is missing', async () => {
      delete mockReq.body.email;

      await createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email, password и роль обязательны'
      });
      expect(supabaseAdmin.auth.admin.createUser).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      delete mockReq.body.password;

      await createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email, password и роль обязательны'
      });
      expect(supabaseAdmin.auth.admin.createUser).not.toHaveBeenCalled();
    });

    it('should return 400 when role is missing', async () => {
      delete mockReq.body.role;

      await createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email, password и роль обязательны'
      });
      expect(supabaseAdmin.auth.admin.createUser).not.toHaveBeenCalled();
    });

    it('should handle Supabase admin creation error', async () => {
      const supabaseError = { message: 'User already exists' };
      
      (supabaseAdmin.auth.admin.createUser as jest.Mock) = jest.fn().mockResolvedValue({
        data: null,
        error: supabaseError
      });

      await createUser(mockReq as Request, mockRes as Response);

      // Verify error logging
      expect(logger.logAdminAction).toHaveBeenCalledWith('create_user_error', {
        adminId: 'admin-user-id',
        error: supabaseError.message,
        email: validUserData.email,
        ip: '127.0.0.1'
      });

      // Verify response
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: supabaseError.message
      });

      // Verify database was not called
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should handle database insertion error', async () => {
      // Mock successful Supabase creation
      (supabaseAdmin.auth.admin.createUser as jest.Mock) = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: validUserData.email } },
        error: null
      });

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Mock database error
      const dbError = new Error('Database connection failed');
      pool.query.mockRejectedValue(dbError);

      await createUser(mockReq as Request, mockRes as Response);

      // Verify error logging
      expect(logger.logAdminAction).toHaveBeenCalledWith('create_user_error', {
        adminId: 'admin-user-id',
        error: dbError.message,
        email: validUserData.email,
        ip: '127.0.0.1'
      });

      // Verify response
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Ошибка создания пользователя'
      });
    });

    it('should handle bcrypt hashing error', async () => {
      // Mock successful Supabase creation
      (supabaseAdmin.auth.admin.createUser as jest.Mock) = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: validUserData.email } },
        error: null
      });

      // Mock bcrypt error
      const bcryptError = new Error('Hashing failed');
      (bcrypt.hash as jest.Mock).mockRejectedValue(bcryptError);

      await createUser(mockReq as Request, mockRes as Response);

      // Verify error logging
      expect(logger.logAdminAction).toHaveBeenCalledWith('create_user_error', {
        adminId: 'admin-user-id',
        error: bcryptError.message,
        email: validUserData.email,
        ip: '127.0.0.1'
      });

      // Verify response
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Ошибка создания пользователя'
      });
    });

    it('should handle missing admin user in request', async () => {
      // Remove user from request
      delete mockReq.user;

      // Mock successful Supabase creation
      (supabaseAdmin.auth.admin.createUser as jest.Mock) = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: validUserData.email } },
        error: null
      });

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Mock successful database insert
      pool.query.mockResolvedValue({ rows: [{ id: 'db-user-123' }] });

      await createUser(mockReq as Request, mockRes as Response);

      // Verify logging with undefined adminId
      expect(logger.logAdminAction).toHaveBeenCalledWith('create_user', {
        adminId: undefined,
        email: validUserData.email,
        organization_id: validUserData.organization_id,
        role: validUserData.role,
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      });

      // Should still complete successfully
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle null organization_id', async () => {
      mockReq.body.organization_id = null;

      // Mock successful Supabase creation
      (supabaseAdmin.auth.admin.createUser as jest.Mock) = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: validUserData.email } },
        error: null
      });

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Mock successful database insert
      pool.query.mockResolvedValue({ rows: [{ id: 'db-user-123' }] });

      await createUser(mockReq as Request, mockRes as Response);

      // Verify database insert with null organization_id
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [
          null, // organization_id should be null
          validUserData.email,
          'hashed-password',
          validUserData.full_name,
          validUserData.role
        ]
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle undefined organization_id', async () => {
      delete mockReq.body.organization_id;

      // Mock successful Supabase creation
      (supabaseAdmin.auth.admin.createUser as jest.Mock) = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: validUserData.email } },
        error: null
      });

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Mock successful database insert
      pool.query.mockResolvedValue({ rows: [{ id: 'db-user-123' }] });

      await createUser(mockReq as Request, mockRes as Response);

      // Verify database insert with null organization_id (undefined becomes null)
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [
          null, // organization_id should be null
          validUserData.email,
          'hashed-password',
          validUserData.full_name,
          validUserData.role
        ]
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});
