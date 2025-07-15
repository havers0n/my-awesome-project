import { Request, Response, NextFunction } from 'express';

export const checkAdminPermission = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    // Check if user object exists and has the role of 'admin'
    if (user && user.role === 'admin') {
        // User is an admin, proceed to the next middleware or route handler
        return next();
    }

    // User is not an admin or user object is not available
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
}; 