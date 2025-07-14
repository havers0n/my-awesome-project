import express from 'express';
import { healthCheck, simpleHealthCheck, mlServiceHealthCheck } from '../controllers/healthController';

const router = express.Router();

// GET /health - комплексный health check всех сервисов
router.get('/', healthCheck);

// GET /health/simple - простой health check backend
router.get('/simple', simpleHealthCheck);

// GET /health/ready - readiness check
router.get('/ready', simpleHealthCheck);

// GET /health/ml - health check ML сервиса
router.get('/ml', mlServiceHealthCheck);

export default router;
