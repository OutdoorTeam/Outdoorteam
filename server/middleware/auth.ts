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
  if (!db) {
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Database not connected');
    return;
  }
  if (!SUPABASE_JWT_SECRET) {
    console.warn('SUPABASE_JWT_SECRET is not set. Skipping authentication.');
    // For local testing without a JWT secret, we can deny access.
    sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'Authentication service not configured');
    return;
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
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', decoded.sub) // Match by Supabase UUID
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

    // Attach our DB user info. The supabase_id is the same as our user.id now.
    req.user = user;
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
