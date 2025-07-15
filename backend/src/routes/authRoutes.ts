import * as express from 'express';
import { resetPassword, getProfile } from '../controllers/authController';
import { updateProfile } from '../controllers/userController';
import { authenticateSupabaseToken } from '../middleware/supabaseAuthMiddleware';

console.log('🔍 authRoutes.ts: Loading auth routes...');

const router = express.Router();

router.post('/reset-password', resetPassword);
router.get('/me', authenticateSupabaseToken, getProfile);

// Simple test endpoint to check if authRoutes are being loaded
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!', timestamp: new Date() });
});

console.log('🔍 authRoutes.ts: About to register profile route...');
// Temporary: Add profile update endpoint here since userRoutes is not loading
router.put('/profile', authenticateSupabaseToken, updateProfile);
console.log('🔍 authRoutes.ts: Profile route registered successfully');

export default router; 