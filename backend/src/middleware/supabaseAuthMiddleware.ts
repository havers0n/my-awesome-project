import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabaseAdminClient';

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
  console.log('=== authenticateSupabaseToken middleware called ===');
  console.log('Request path:', req.path);
  console.log('Request method:', req.method);
  
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided or invalid format');
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Extracted token (first 20 chars):', token.substring(0, 20) + '...');
    
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    console.log('Supabase auth response - error:', error);
    console.log('Supabase auth response - user exists:', !!data?.user);
    
    if (error || !data?.user) {
      console.log('Invalid token or user not found');
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    
    const user = data.user;
    console.log('User ID:', user.id);
    console.log('User email:', user.email);
    
    // Получаем профиль пользователя из public.users
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role, location_id')
      .eq('id', user.id)
      .single();
      
    console.log('Profile query - error:', profileError);
    console.log('Profile query - data:', profile);
    
    if (profileError || !profile) {
      console.log('User profile not found');
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
      console.log('Location query - error:', locationError);
      console.log('Organization ID:', organization_id);
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      authType: 'supabase',
      location_id: profile.location_id ? (typeof profile.location_id === 'string' ? parseInt(profile.location_id, 10) : profile.location_id) : null,
      organization_id,
    };
    
    console.log('req.user set to:', req.user);
    console.log('=== middleware completed successfully ===');
    next();
  } catch (err) {
    console.error('=== middleware error ===', err);
    res.status(500).json({ error: 'Authentication failed' });
    return;
  }
} 