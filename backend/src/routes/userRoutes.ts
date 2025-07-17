import * as express from 'express';
import { getUsers, updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', authenticate, getUsers);

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticate, updateProfile);

export default router; 