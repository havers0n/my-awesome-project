// backend/src/routes/adminRoutes.ts
import express from 'express';
import { createUser } from '../controllers/adminController';
import { authenticateSupabaseToken } from '../middleware/supabaseAuthMiddleware';

const router = express.Router();

// POST /admin/users — создание пользователя с логированием
router.post('/users', authenticateSupabaseToken, createUser);

export default router;
