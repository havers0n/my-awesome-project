import { Router } from 'express';
import { 
  getUserPreferences, 
  saveUserPreferences, 
  saveSidebarPreferences 
} from '../controllers/userPreferencesController';
import { authenticateSupabaseToken } from '../middleware/supabaseAuthMiddleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticateSupabaseToken);

// Получить все настройки пользователя
router.get('/', getUserPreferences);

// Сохранить все настройки пользователя
router.post('/', saveUserPreferences);

// Сохранить настройки сайдбара
router.post('/sidebar', saveSidebarPreferences);

export default router; 