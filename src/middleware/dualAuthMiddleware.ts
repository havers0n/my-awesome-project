import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../services/supabaseAdminClient';
import { pool } from '../db';

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

export const dualAuthenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token required' });
    return;
  }

  try {
    // Сначала пробуем как Supabase токен
    if (supabaseAdmin) {
      const { data: { user: supabaseUser }, error: supabaseError } = await supabaseAdmin.auth.getUser(token);
      
      if (!supabaseError && supabaseUser) {
        let userRole = 'employee';
        let locationId: number | null = null;
        let organizationId: number | null = null;
        try {
          // Получаем роль и location_id из user_profiles
          const profileResult = await pool.query(
            'SELECT role, location_id FROM public.user_profiles WHERE id = $1', 
            [supabaseUser.id]
          );
          if (profileResult.rows.length > 0) {
            if (profileResult.rows[0].role) {
              userRole = profileResult.rows[0].role;
            }
            locationId = profileResult.rows[0].location_id;
            if (locationId) {
              // Получаем organization_id через таблицу locations
              const orgResult = await pool.query(
                'SELECT organization_id FROM public.locations WHERE id = $1',
                [locationId]
              );
              if (orgResult.rows.length > 0) {
                organizationId = orgResult.rows[0].organization_id;
              }
            }
          }
        } catch (profileError) {
          console.error('Error fetching profile/location for Supabase user:', profileError);
        }
        
        req.user = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role: userRole,
          authType: 'supabase',
          location_id: locationId,
          organization_id: organizationId
        };
        next();
        return;
      }
    } else {
      console.warn('Supabase Admin Client not available for token validation.');
    }

    // Если не Supabase токен (или supabaseAdmin не доступен), пробуем как JWT токен (старая система)
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined for legacy token validation.');
        throw new Error('JWT_SECRET not configured');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    const userResult = await pool.query(
      'SELECT id, email, role, organization_id FROM public.users WHERE id = $1', 
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      res.status(403).json({ error: 'User not found for legacy token' });
      return;
    }

    req.user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      role: userResult.rows[0].role,
      authType: 'legacy',
      organization_id: userResult.rows[0].organization_id,
      location_id: null
    };
    
    next();
  } catch (error: any) {
    console.error('Dual auth token validation error:', error.message);
    res.status(403).json({ error: 'Invalid token' });
  }
}; 