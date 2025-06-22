import express from 'express';
import { resetPassword, getProfile } from '../controllers/authController';
import { authenticateSupabaseToken } from '../middleware/supabaseAuthMiddleware';

const router = express.Router();

router.post('/reset-password', resetPassword);
router.get('/me', authenticateSupabaseToken, getProfile);

export default router; 