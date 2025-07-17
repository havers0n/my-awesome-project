import { Router } from 'express';
import { 
  getUserPreferences, 
  saveUserPreferences, 
  saveSidebarPreferences 
} from '../controllers/userPreferencesController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/preferences', getUserPreferences);
router.post('/preferences', saveUserPreferences);
router.post('/sidebar-preferences', saveSidebarPreferences);

export default router;