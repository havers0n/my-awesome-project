import * as express from 'express';
import { updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticate, updateProfile);

export default router; 