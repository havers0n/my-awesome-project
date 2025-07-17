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
router.get('/me', authenticate, (req, res) => {
  // Теперь req.user гарантированно существует благодаря middleware
  if (req.user) {
    res.json({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      organization_id: req.user.organization_id,
      location_id: req.user.location_id,
      authType: req.user.authType,
    });
  } else {
    // Эта ветка по идее не должна выполниться, если authenticate работает правильно
    res.status(401).json({ error: 'Authentication failed' });
  }
});
router.put('/profile', authenticate, updateProfile);

console.log('🔍 authRoutes.ts: About to register profile route...');
console.log('🔍 authRoutes.ts: Profile route registered successfully');

export default router; 