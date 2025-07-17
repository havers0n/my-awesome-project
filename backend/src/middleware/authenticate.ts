import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../supabaseClient';
import { JWT_CONFIG, SUPABASE_JWT_CONFIG } from '../config';

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

  // 1. Попытка аутентификации через Supabase JWT
  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_CONFIG.secret) as { sub: string, email: string, role: string, aud: string, iss: string };

    // Валидация стандартных клеймов для Supabase
    if (decoded.aud !== 'authenticated') {
      throw new Error('Invalid token audience');
    }
    // Здесь хорошо бы проверить и issuer (iss), если он вам известен и постоянен
    // if (!decoded.iss.startsWith(process.env.SUPABASE_URL)) {
    //   throw new Error('Invalid token issuer');
    // }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role, location_id, organization_id')
      .eq('id', decoded.sub) // `sub` в JWT это user_id
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      res.status(500).json({ error: 'Failed to fetch user profile', details: profileError.message });
      return;
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: profile?.role,
      authType: 'supabase',
      organization_id: profile?.organization_id || null,
      location_id: profile?.location_id || null,
    };
    
    return next();

  } catch (err) {
    if (err instanceof Error) {
      console.log('Supabase JWT verification failed, trying legacy JWT...', err.message);
    } else {
      console.log('Supabase JWT verification failed, trying legacy JWT...', err);
    }
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
      organization_id: decoded.organization_id || null,
      location_id: decoded.location_id || null,
    };

    return next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};
