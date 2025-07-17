import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if a user is associated with an organization.
 * This should be used on routes that require an organization context.
 */
export const requireOrganization = (req: Request, res: Response, next: NextFunction): void => {
  // This middleware must run after the 'authenticate' middleware,
  // so req.user should be populated.
  if (!req.user || !req.user.organization_id) {
    res.status(400).json({ error: 'User is not associated with an organization.' });
    return;
  }

  // User has an organization, proceed to the next handler.
  next();
};
