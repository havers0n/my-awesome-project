import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { MLDataService } from '../services/mlDataService';
import { getSupabaseUserClient } from '../supabaseUserClient';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/ml/features/:productId
 * Get product features from database
 */
router.get('/features/:productId', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { targetDate } = req.query;
    
    // Get organization_id from user token
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseUserClient(token);
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single();
      
    if (profileError || !profile?.organization_id) {
      res.status(400).json({ error: 'User not associated with organization' });
      return;
    }
    
    const date = targetDate ? new Date(targetDate as string) : new Date();
    
    const features = await MLDataService.getProductFeatures(
      productId,
      date,
      profile.organization_id
    );
    
    res.json({ success: true, features });
  } catch (error) {
    console.error('Error getting product features:', error);
    res.status(500).json({ 
      error: 'Failed to get product features',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;