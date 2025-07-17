import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Use SERVICE_ROLE_KEY instead of ANON_KEY
);

export const verifySupabaseJWT = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  console.log('[AuthMiddleware] Verifying JWT...');
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AuthMiddleware] Error: Authorization header missing or malformed.');
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[AuthMiddleware] Token found:', token ? 'Yes' : 'No');

  try {
    // Verify the token using the service client and passing the token explicitly
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('[AuthMiddleware] Supabase auth error:', error.message);
      return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
    
    if (!user) {
      console.log('[AuthMiddleware] Error: User not found for the provided token.');
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('[AuthMiddleware] JWT verification successful. User:', user.email);
    req.user = user;
    next();
  } catch (err: any) {
    console.error('[AuthMiddleware] Catch block error:', err.message);
    return res.status(401).json({ error: 'Token validation error', details: err.message });
  }
}; 