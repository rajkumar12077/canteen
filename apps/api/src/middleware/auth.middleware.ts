import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { db } from '../storage';
import { User, UserRole } from '@smart-canteen/shared';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no header, allow demo mode or fallback to default customer if specified
    const demoRole = req.headers['x-demo-role'] as string;
    if (demoRole) {
      const demoUser = db.findOne<User>('users', u => u.role === demoRole);
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
    }
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };
    const user = db.findOne<User>('users', u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token invalid' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
      return next(); // Admins have universal access
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of roles [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }
    next();
  };
};
