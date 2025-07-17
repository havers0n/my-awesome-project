// backend/src/routes/adminRoutes.ts
import * as express from 'express';
import { createUser, checkEmail } from '../controllers/adminController'; // Добавляем checkEmail
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// GET /admin/users/check-email - Проверка уникальности email
router.get('/users/check-email', authenticate, checkEmail);

// POST /admin/users - Создание нового пользователя
router.post('/users', authenticate, createUser);

export default router;
