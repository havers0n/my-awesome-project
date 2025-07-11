import express from 'express';
import { healthCheck, simpleHealthCheck, mlServiceHealthCheck } from '../controllers/healthController';

const router = express.Router();

// GET /health - комплексный health check всех сервисов
router.get('/health', healthCheck);

// GET /health/simple - простой health check backend
router.get('/health/simple', simpleHealthCheck);

// GET /health/ml - health check ML сервиса
router.get('/health/ml', mlServiceHealthCheck);

export default router;
