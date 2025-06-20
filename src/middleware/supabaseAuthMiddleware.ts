import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabaseAdminClient';

// Расширяем Express.Request для req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
        email?: string;
        role?: string;
        authType: 'supabase' | 'legacy';
        organization_id: number | null;
        location_id: number | null;
      };
    }
  }
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  location_id: string;
}

export async function authenticateSupabaseToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    const user = data.user;
    // Получаем профиль пользователя из public.users
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role, location_id')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) {
      res.status(403).json({ error: 'User profile not found' });
      return;
    }
    // Получаем organization_id через таблицу locations
    let organization_id: number | null = null;
    if (profile.location_id) {
      const { data: location, error: locationError } = await supabaseAdmin
        .from('locations')
        .select('organization_id')
        .eq('id', profile.location_id)
        .single();
      if (!locationError && location) {
        organization_id = typeof location.organization_id === 'string' ? parseInt(location.organization_id, 10) : location.organization_id;
      }
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      authType: 'supabase',
      location_id: profile.location_id ? (typeof profile.location_id === 'string' ? parseInt(profile.location_id, 10) : profile.location_id) : null,
      organization_id,
    };
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed' });
    return;
  }
} 