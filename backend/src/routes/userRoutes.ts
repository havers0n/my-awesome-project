import * as express from 'express';
import { updateProfile } from '../controllers/userController';
import { authenticateSupabaseToken } from '../middleware/supabaseAuthMiddleware';

const router = express.Router();

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateSupabaseToken, updateProfile);

export default router; 