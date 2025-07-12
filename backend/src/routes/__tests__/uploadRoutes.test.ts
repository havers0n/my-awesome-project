import express from 'express';
import request from 'supertest';
import uploadRouter from '../uploadRoutes';
import * as dualAuthMiddleware from '../../middleware/dualAuthMiddleware';
import multer from 'multer';

jest.mock('../../middleware/dualAuthMiddleware');
jest.mock('multer');

describe('Upload Routes', () => {
  let app: express.Application;
  let mockMulter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/upload', uploadRouter);
    
    // Mock middleware to pass through
    (dualAuthMiddleware.dualAuthenticateToken as jest.Mock).mockImplementation(
      (req, res, next) => {
        req.user = {
          id: 'test-user-id',
          email: 'test@example.com',
          organization_id: 'test-org-id'
        };
        next();
      }
    );

    // Mock multer
    mockMulter = {
      single: jest.fn().mockReturnValue((req: any, res: any, next: any) => {
        req.file = {
          originalname: 'test.xlsx',
          buffer: Buffer.from('test data'),
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        next();
      })
    };
    (multer as any).mockReturnValue(mockMulter);
  });

  describe('POST /api/upload/file', () => {
    it('should handle file upload successfully', async () => {
      const response = await request(app)
        .post('/api/upload/file')
        .attach('file', Buffer.from('test data'), 'test.xlsx')
        .set('Content-Type', 'multipart/form-data');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(dualAuthMiddleware.dualAuthenticateToken).toHaveBeenCalled();
    });

    it('should require authentication', async () => {
      (dualAuthMiddleware.dualAuthenticateToken as jest.Mock).mockImplementation(
        (req, res, next) => {
          res.status(401).json({ error: 'Unauthorized' });
        }
      );

      const response = await request(app)
        .post('/api/upload/file')
        .attach('file', Buffer.from('test data'), 'test.xlsx');

      expect(response.status).toBe(401);
    });

    it('should reject non-Excel files', async () => {
      mockMulter.single.mockReturnValue((req: any, res: any, next: any) => {
        req.file = {
          originalname: 'test.txt',
          buffer: Buffer.from('test data'),
          mimetype: 'text/plain'
        };
        next();
      });

      const response = await request(app)
        .post('/api/upload/file')
        .attach('file', Buffer.from('test data'), 'test.txt');

      expect(response.status).toBe(400);
    });
  });

  describe('Test route', () => {
    it('should return test response', async () => {
      const response = await request(app)
        .get('/api/upload/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ route: 'upload' });
    });
  });
});
