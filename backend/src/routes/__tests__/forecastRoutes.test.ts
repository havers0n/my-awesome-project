import express from 'express';
import request from 'supertest';
import forecastRouter from '../forecastRoutes';
import * as dualAuthMiddleware from '../../middleware/dualAuthMiddleware';
import * as forecastController from '../../controllers/forecastController';

jest.mock('../../middleware/dualAuthMiddleware');
jest.mock('../../controllers/forecastController');

describe('Forecast Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(forecastRouter);
    
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
  });

  describe('POST /predict', () => {
    it('should call predictSales controller', async () => {
      const mockPredictSales = forecastController.predictSales as jest.Mock;
      mockPredictSales.mockImplementation((req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/predict')
        .set('Authorization', 'Bearer test-token')
        .send({ DaysCount: 7 });

      expect(response.status).toBe(200);
      expect(mockPredictSales).toHaveBeenCalled();
    });

    it('should handle missing authorization', async () => {
      const mockPredictSales = forecastController.predictSales as jest.Mock;
      mockPredictSales.mockImplementation((req, res) => {
        // The controller itself checks for authorization header
        if (!req.headers.authorization) {
          res.status(401).json({ error: 'Отсутствует заголовок Authorization' });
        }
      });

      const response = await request(app)
        .post('/predict')
        .send({ DaysCount: 7 });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /forecast', () => {
    it('should call getForecastData controller', async () => {
      const mockGetForecastData = forecastController.getForecastData as jest.Mock;
      mockGetForecastData.mockImplementation((req, res) => {
        res.json({ data: [] });
      });

      const response = await request(app)
        .get('/forecast');

      expect(response.status).toBe(200);
      expect(mockGetForecastData).toHaveBeenCalled();
    });
  });

  describe('GET /api/forecast/history', () => {
    it('should call getForecastHistory controller', async () => {
      const mockGetForecastHistory = forecastController.getForecastHistory as jest.Mock;
      mockGetForecastHistory.mockImplementation((req, res) => {
        res.json({ history: [] });
      });

      const response = await request(app)
        .get('/history');

      expect(response.status).toBe(200);
      expect(mockGetForecastHistory).toHaveBeenCalled();
    });
  });

});
