// backend/src/routes/adminRoutes.ts
import express from 'express';
import { createUser, checkEmail } from '../controllers/adminController'; // Добавляем checkEmail
import { authenticateSupabaseToken } from '../middleware/supabaseAuthMiddleware';

const router = express.Router();

// GET /admin/users/check-email - Проверка уникальности email
router.get('/users/check-email', authenticateSupabaseToken, checkEmail);

// POST /admin/users — создание пользователя с логированием
router.post('/users', authenticateSupabaseToken, createUser);

export default router;
