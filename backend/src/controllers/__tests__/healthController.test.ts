import { Request, Response } from 'express';
import { 
  healthCheck, 
  simpleHealthCheck, 
  mlServiceHealthCheck,
  getHealth,
  getReadiness 
} from '../healthController';
import { pool } from '../../db';
import axios from 'axios';

jest.mock('../../db', () => ({
  pool: {
    query: jest.fn()
  }
}));

jest.mock('axios');

describe('HealthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should return healthy status when all checks pass', async () => {
      // Mock successful database check
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ now: new Date() }] });
      
      // Mock successful ML service check
      (axios.get as jest.Mock).mockResolvedValue({ status: 200 });

      await getHealth(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'healthy',
        timestamp: expect.any(String),
        services: {
          backend: {
            status: 'healthy',
            message: 'Backend service is running'
          },
          ml_service: {
            status: 'healthy',
            message: 'ML service is available'
          }
        }
      });
    });

    it('should return unhealthy status when database check fails', async () => {
      // Mock failed database check
      (pool.query as jest.Mock).mockRejectedValue(new Error('Connection refused'));
      
      // Mock successful ML service check
      (axios.get as jest.Mock).mockResolvedValue({ status: 200 });

      await getHealth(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'degraded',
        timestamp: expect.any(String),
        services: {
          backend: {
            status: 'healthy',
            message: 'Backend service is running'
          },
          ml_service: {
            status: 'healthy',
            message: 'ML service is available'
          }
        }
      });
    });

    it('should return unhealthy status when ML service check fails', async () => {
      // Mock successful database check
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ now: new Date() }] });
      
      // Mock failed ML service check
      (axios.get as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

      await getHealth(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'degraded',
        timestamp: expect.any(String),
        services: {
          backend: {
            status: 'healthy',
            message: 'Backend service is running'
          },
          ml_service: {
            status: 'unhealthy',
            message: expect.stringContaining('ML service')
          }
        }
      });
    });

    it('should handle ML service non-200 status codes', async () => {
      // Mock successful database check
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ now: new Date() }] });
      
      // Mock ML service returning 500
      (axios.get as jest.Mock).mockResolvedValue({ status: 500 });

      await getHealth(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'degraded',
          services: expect.objectContaining({
            ml_service: expect.objectContaining({
              status: 'unhealthy',
              message: 'ML service returned non-200 status'
            })
          })
        })
      );
    });
  });

  describe('getReadiness', () => {
    it('should return ready when database is accessible', async () => {
      // Mock successful database check
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ now: new Date() }] });

      await getReadiness(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'healthy',
        timestamp: expect.any(String),
        message: 'Backend service is running'
      });
    });

    it('should return healthy status regardless of external dependencies', async () => {
      await getReadiness(mockReq as Request, mockRes as Response);

      expect(mockRes.status).not.toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'healthy',
        timestamp: expect.any(String),
        message: 'Backend service is running'
      });
    });
    });
  });
});
