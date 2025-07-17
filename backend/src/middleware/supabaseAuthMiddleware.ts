import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabaseAdminClient';

/**
 * Middleware для аутентификации через Supabase tokens
 * Основан на тестах в __tests__/supabaseAuthMiddleware.test.ts
 */
export const authenticateSupabaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Проверяем токен через Supabase Admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      res.status(401).json({ error: 'Invalid Supabase token', details: userError?.message });
      return;
    }

    // Получаем профиль пользователя из таблицы users
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role, default_location_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      res.status(500).json({ error: 'Failed to fetch user profile', details: profileError.message });
      return;
    }

    let organizationId: number | null = null;

    // Если у пользователя есть default_location_id, получаем organization_id из locations
    if (profile?.default_location_id) {
      const { data: location, error: locationError } = await supabaseAdmin
        .from('locations')
        .select('organization_id')
        .eq('id', profile.default_location_id)
        .single();

      if (locationError) {
        console.error('Error fetching location:', locationError);
        // Не падаем, просто organization_id останется null
      } else {
        organizationId = location?.organization_id || null;
      }
    }

    // Устанавливаем пользователя в request (используем приведение типов как в других middleware)
    (req as any).user = {
      id: user.id,
      email: user.email,
      role: profile?.role || null,
      authType: 'supabase',
      location_id: profile?.default_location_id || null,
      organization_id: organizationId,
    };

    next();

  } catch (error) {
    console.error('Unexpected error in authenticateSupabaseToken:', error);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}; 