import * as express from 'express';
import { resetPassword, getProfile } from '../controllers/authController';
import { updateProfile } from '../controllers/userController';
import { authenticateSupabaseToken } from '../middleware/supabaseAuthMiddleware';
import { verifySupabaseJWT } from '../middleware/authMiddleware';

console.log('🔍 authRoutes.ts: Loading auth routes...');

const router = express.Router();

router.post('/reset-password', resetPassword);
router.get('/me', verifySupabaseJWT, async (req, res) => {
  try {
    // User is now available via req.user
    const user = req.user;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple test endpoint to check if authRoutes are being loaded
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!', timestamp: new Date() });
});

console.log('🔍 authRoutes.ts: About to register profile route...');
// Temporary: Add profile update endpoint here since userRoutes is not loading
router.put('/profile', authenticateSupabaseToken, updateProfile);
console.log('🔍 authRoutes.ts: Profile route registered successfully');

export default router; 