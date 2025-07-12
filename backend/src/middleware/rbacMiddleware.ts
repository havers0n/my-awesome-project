import { Request, Response, NextFunction } from 'express';

/**
 * RBAC middleware: Проверяет, что у пользователя есть нужная роль или право для доступа к ресурсу.
 * @param allowedRoles - массив ролей (например, ['admin', 'owner'])
 * @param requiredPermissions - массив кодов прав (например, ['products:read'])
 */
export function rbacMiddleware(allowedRoles: string[] = [], requiredPermissions: string[] = []) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    // Проверка по ролям
    if (allowedRoles.length && !allowedRoles.includes(req.user.role || '')) {
      res.status(403).json({ error: 'Insufficient role' });
      return;
    }
    // TODO: Проверка по permissions (если реализовано хранение прав в БД)
    // Например, запросить права пользователя по его роли и organization_id
    // и сравнить с requiredPermissions
    // ...
    next();
  };
}

// Экспорт для обратной совместимости
export const checkRole = rbacMiddleware;

// Пример использования:
// router.get('/products', rbacMiddleware(['admin', 'owner'], ['products:read']), handler);
