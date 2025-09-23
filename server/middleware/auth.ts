import jwt from 'jsonwebtoken';
import { db } from '../database.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';
import type { Request, Response, NextFunction } from 'express';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Authentication middleware for Supabase JWT
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  if (!SUPABASE_JWT_SECRET) {
    console.warn('SUPABASE_JWT_SECRET is not set. Skipping authentication.');
    // In a real scenario, you might want to deny access if the secret is missing.
    // For local testing, we can allow it to proceed but without a user object.
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'Access token is required');
    return;
  }

  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
    
    // The 'sub' claim in a Supabase JWT is the user's UUID.
    // We need to find the user in our database. Assuming our `users` table
    // has a column that stores the Supabase user UUID. If not, this needs adjustment.
    // For now, let's assume we are matching by email.
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', decoded.email)
      .executeTakeFirst();

    if (!user) {
      await SystemLogger.logAuthError('User not found for token', decoded.email, req);
      sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'User not found');
      return;
    }

    if (!user.is_active) {
      await SystemLogger.logAuthError('Inactive user attempted access', user.email, req);
      sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'Account is deactivated');
      return;
    }

    // Attach both Supabase user info and our DB user info
    req.user = { ...user, supabase_id: decoded.sub };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    await SystemLogger.logAuthError('Invalid token', undefined, req);
    sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'Invalid or expired token');
    return;
  }
};

// Admin middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    sendErrorResponse(res, ERROR_CODES.AUTHORIZATION_ERROR, 'Access denied. Administrator permissions are required.');
    return;
  }
  next();
};
