import express from 'express';
import { authenticateSupabaseToken } from '../middleware/supabaseAuthMiddleware';
import { MLDataService } from '../services/mlDataService';
import { getSupabaseUserClient } from '../supabaseUserClient';

const router = express.Router();

// Применяем аутентификацию ко всем роутам
router.use(authenticateSupabaseToken);

/**
 * GET /api/ml/features/:productId
 * Получить признаки для товара из БД
 */
router.get('/features/:productId', async (req: express.Request, res: express.Response) => {
  try {
    const { productId } = req.params;
    const { targetDate } = req.query;
    
    // Получаем organization_id из токена пользователя
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseUserClient(token);
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single();
      
    if (profileError || !profile?.organization_id) {
      return res.status(400).json({ error: 'User not associated with organization' });
    }
    
    const date = targetDate ? new Date(targetDate as string) : new Date();
    
    const features = await MLDataService.getProductFeatures(
      productId,
      date,
      profile.organization_id
    );
    
    if (!features) {
      return res.status(404).json({ error: 'No data found for product' });
    }
    
    res.json(features);
  } catch (error) {
    console.error('Error getting ML features:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/ml/metrics/:productId
 * Получить метрики точности для товара
 */
router.get('/metrics/:productId', async (req: express.Request, res: express.Response) => {
  try {
    const { productId } = req.params;
    
    // Получаем organization_id (аналогично предыдущему роуту)
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseUserClient(token);
    
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userData.user?.id)
      .single();
      
    if (!profile?.organization_id) {
      return res.status(400).json({ error: 'User not associated with organization' });
    }
    
    const metrics = await MLDataService.getProductMetrics(
      productId,
      profile.organization_id
    );
    
    if (!metrics) {
      return res.status(404).json({ error: 'No metrics found for product' });
    }
    
    res.json(metrics);
  } catch (error) {
    console.error('Error getting ML metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 