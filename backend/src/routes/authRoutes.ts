import * as express from 'express';
import { resetPassword, getProfile } from '../controllers/authController';
import { updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';

console.log('🔍 authRoutes.ts: Loading auth routes...');

const router = express.Router();

// Public routes
router.post('/reset-password', resetPassword);
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!', timestamp: new Date() });
});

// Protected routes
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

console.log('🔍 authRoutes.ts: About to register profile route...');
console.log('🔍 authRoutes.ts: Profile route registered successfully');

export default router; 