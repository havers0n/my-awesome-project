import { logAdminAction } from '../logger';
import fs from 'fs';
import path from 'path';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('Logger Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    // Mock successful file write by default
    (mockFs.appendFile as any) = jest.fn((path, data, callback) => {
      callback(null);
    });
  });

  describe('logAdminAction', () => {
    it('should log admin action with all details', () => {
      const action = 'create_user';
      const details = {
        adminId: 'admin-123',
        email: 'newuser@example.com',
        organization_id: 'org-123',
        role: 'user',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      };

      logAdminAction(action, details);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ADMIN_ACTION]',
        expect.stringContaining(action),
        expect.objectContaining({
          adminId: details.adminId,
          email: details.email,
          organization_id: details.organization_id,
          role: details.role,
          ip: details.ip,
          userAgent: details.userAgent,
          timestamp: expect.any(String)
        })
      );
    });

    it('should log admin action with minimal details', () => {
      const action = 'delete_user';
      const details = {
        adminId: 'admin-456',
        userId: 'user-789'
      };

      logAdminAction(action, details);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ADMIN_ACTION]',
        expect.stringContaining(action),
        expect.objectContaining({
          adminId: details.adminId,
          userId: details.userId,
          timestamp: expect.any(String)
        })
      );
    });

    it('should include timestamp in the log', () => {
      const action = 'update_settings';
      const details = { adminId: 'admin-001' };

      logAdminAction(action, details);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ADMIN_ACTION]',
        expect.any(String),
        expect.objectContaining({
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
        })
      );
    });

    it('should handle empty details object', () => {
      const action = 'view_logs';
      const details = {};

      logAdminAction(action, details);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ADMIN_ACTION]',
        expect.stringContaining(action),
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });

    it('should handle null or undefined values in details', () => {
      const action = 'failed_action';
      const details = {
        adminId: null,
        error: undefined,
        success: false
      };

      logAdminAction(action, details);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ADMIN_ACTION]',
        expect.stringContaining(action),
        expect.objectContaining({
          adminId: null,
          error: undefined,
          success: false,
          timestamp: expect.any(String)
        })
      );
    });
  });
});
