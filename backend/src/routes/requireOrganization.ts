import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if a user is associated with an organization.
 * This should be used on routes that require an organization context.
 */
export const requireOrganization = (req: Request, res: Response, next: NextFunction): void => {
  // This middleware must run after the 'authenticate' middleware,
  // so req.user should be populated.
  const user = (req as any).user;
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
  
  // ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ДЛЯ ДИАГНОСТИКИ
  console.log('\n=== REQUIRE ORGANIZATION MIDDLEWARE ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('isDevelopment:', isDevelopment);
  console.log('User object:', user ? {
    id: user.id,
    email: user.email,
    organization_id: user.organization_id,
    role: user.role,
    authType: user.authType
  } : 'null/undefined');
  console.log('==========================================\n');
  
  if (!user || !user.organization_id) {
    // В development режиме или если NODE_ENV не установлена, выводим предупреждение и продолжаем
    if (isDevelopment || !process.env.NODE_ENV) {
      console.warn('⚠️  [DEV MODE] User has no organization_id, assigning default organization for development');
      console.warn('⚠️  [DEV MODE] This is UNSAFE for production! User:', user?.email || user?.id);
      console.warn('⚠️  [DEV MODE] NODE_ENV:', process.env.NODE_ENV || 'undefined');
      
      // Назначаем фиктивную организацию для разработки
      if (user) {
        user.organization_id = 1; // Тестовая организация
        user.role = user.role || 'employee';
        console.warn('⚠️  [DEV MODE] Assigned organization_id = 1 to user');
      }
      
      next();
      return;
    }
    
    // В production режиме блокируем доступ
    console.error('[SECURITY] User attempted to access organization-restricted resource without organization_id');
    console.error('[SECURITY] User details:', { id: user?.id, email: user?.email, org_id: user?.organization_id });
    res.status(400).json({ error: 'User is not associated with an organization.' });
    return;
  }

  console.log('✅ User has organization_id:', user.organization_id);
  // User has an organization, proceed to the next handler.
  next();
};
