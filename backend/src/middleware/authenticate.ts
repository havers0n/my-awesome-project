import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../supabaseAdminClient';
import { JWT_CONFIG } from '../config';

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
        [key: string]: any;
      };
    }
  }
}

/**
 * Единый middleware для аутентификации.
 * Сначала пытается проверить токен через Supabase.
 * Если не удается, проверяет как устаревший JWT.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  // 1. Попытка аутентификации через Supabase
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (user && !error) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users') // Используем 'users' как в supabaseAuthMiddleware
        .select('role, location_id, organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        res.status(500).json({ error: 'Failed to fetch user profile', details: profileError.message });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: profile.role,
        authType: 'supabase',
        location_id: profile.location_id,
        organization_id: profile.organization_id,
      };
      
      return next();
    }
  } catch (e) {
     // Игнорируем ошибку и переходим к проверке legacy JWT
    console.log('Supabase auth failed, trying legacy JWT...');
  }

  // 2. Попытка аутентификации через устаревший JWT
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as { id: string, role: string, organization_id: number, location_id: number };
    
    // Здесь можно добавить проверку пользователя в старой БД, если нужно
    // Для примера просто доверяем токену
    req.user = {
      id: decoded.id,
      role: decoded.role,
      authType: 'legacy',
      organization_id: decoded.organization_id,
      location_id: decoded.location_id,
    };

    return next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};
