import { Request, Response } from 'express';
import {
  getUserMonetization,
  getOrganizationMonetization,
  updateSubscriptionSettings,
  cancelSubscription,
  getSavingsPercentageDetails,
  getPayPerUseDetails
} from '../monetizationController';
import { pool } from '../../db';

jest.mock('../../db', () => ({
  pool: {
    query: jest.fn()
  }
}));

const mockPool = pool as jest.Mocked<typeof pool>;

describe('MonetizationController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      user: {
        id: 'user-id',
        role: 'admin',
        organization_id: 1
      }
    } as any;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getUserMonetization', () => {
    it('should return monetization details for the user', async () => {
      const mockMonetizationRows = [{
        id: 1,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        details: { example: 'details' },
        type_code: 'SUBSCRIPTION',
        model_name: 'Subscription Model',
        model_description: 'A subscription model'
      }];

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockMonetizationRows });
      await getUserMonetization(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        monetizationDetails: mockMonetizationRows.map(row => ({
          type: row.type_code,
          name: row.model_name,
          description: row.model_description,
          status: row.status,
          startDate: row.start_date,
          endDate: row.end_date,
          details: row.details
        }))
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      delete mockReq.user;

      await getUserMonetization(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });
    // More tests for error cases...
  });

  describe('getOrganizationMonetization', () => {
    it('should return monetization details for the organization if user is admin', async () => {
      const mockMonetizationRows = [{
        id: 1,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        details: { example: 'details' },
        type_code: 'SUBSCRIPTION',
        model_name: 'Subscription Model',
        model_description: 'A subscription model'
      }];

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockMonetizationRows });
      mockReq.params = { organizationId: '1' };

      await getOrganizationMonetization(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        monetizationDetails: mockMonetizationRows.map(row => ({
          type: row.type_code,
          name: row.model_name,
          description: row.model_description,
          status: row.status,
          startDate: row.start_date,
          endDate: row.end_date,
          details: row.details
        }))
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      delete mockReq.user;

      await getOrganizationMonetization(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });
    // More tests for role and permission errors...
  });

  describe('updateSubscriptionSettings', () => {
    it('should update subscription settings for the user', async () => {
      const mockSettings = { newSetting: 'value' };
      mockReq.body = { subscriptionId: 1, settings: mockSettings };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 1, details: { updated: true } }]
      });

      await updateSubscriptionSettings(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Subscription settings updated successfully',
        subscription: { id: 1, details: { updated: true } }
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      delete mockReq.user;

      await updateSubscriptionSettings(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });
    // More tests for permission errors...
  });

  describe('cancelSubscription', () => {
    it('should cancel the subscription for the user', async () => {
      const mockSubscription = { cancellation_reason: 'User requested', cancellation_date: new Date() };
      mockReq.body = { subscriptionId: 1, reason: 'User requested' };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 1, status: 'INACTIVE', details: mockSubscription }]
      });

      await cancelSubscription(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Subscription cancelled successfully',
        subscription: { id: 1, status: 'INACTIVE', details: mockSubscription }
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      delete mockReq.user;

      await cancelSubscription(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });
    // More tests for permission errors...
  });

  describe('getSavingsPercentageDetails', () => {
    it('should return savings percentage details for the user', async () => {
      const mockRows = [{
        id: 1,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        details: { percentage: 10 }
      }];

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      await getSavingsPercentageDetails(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        savingsPercentage: 10,
        status: 'active',
        startDate: mockRows[0].start_date,
        endDate: mockRows[0].end_date,
        details: mockRows[0].details
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      delete mockReq.user;

      await getSavingsPercentageDetails(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });
    // More tests for organization checks...
  });

  describe('getPayPerUseDetails', () => {
    it('should return pay-per-use details for the user', async () => {
      const mockRows = [{
        id: 1,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        details: { usage: 100, cost: 10 }
      }];

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      await getPayPerUseDetails(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        payPerUse: mockRows[0].details,
        status: 'active',
        startDate: mockRows[0].start_date,
        endDate: mockRows[0].end_date
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      delete mockReq.user;

      await getPayPerUseDetails(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });
    // More tests for organization checks...
  });
});

