import { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import { ERROR_CODES, sendErrorResponse } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';

// Define allowed origins based on environment
const getAllowedOrigins = (): (string | RegExp)[] => {
  const defaultOrigins = [
    'capacitor://localhost',
    'http://localhost',
    /http:\/\/localhost:\d+$/,
    /http:\/\/127\.0\.0\.1:\d+$/,
  ];

  const envOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) 
    : [];

  return [...defaultOrigins, ...envOrigins];
};

// Custom origin validation function
const validateOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  const allowedOrigins = getAllowedOrigins();
  
  // Allow requests with no origin (e.g., mobile apps, server-to-server, same-origin)
  if (!origin) {
    callback(null, true);
    return;
  }
  
  // Check if origin matches any of the allowed origins (string or RegExp)
  for (const allowed of allowedOrigins) {
    if (typeof allowed === 'string' && allowed === origin) {
      callback(null, true);
      return;
    }
    if (allowed instanceof RegExp && allowed.test(origin)) {
      callback(null, true);
      return;
    }
  }
  
  // Log blocked origin attempt
  console.warn(`CORS: Blocked origin attempt: ${origin}`);
  SystemLogger.log('warn', 'CORS origin blocked', {
    metadata: {
      blocked_origin: origin,
      allowed_origins: allowedOrigins.map(o => o.toString()),
    }
  });
  
  callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
};

// CORS configuration
export const corsOptions: CorsOptions = {
  origin: validateOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'Accept',
    'X-Requested-With',
    'Origin',
    'X-Internal-API-Key',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: [
    'Content-Disposition',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 600,
  optionsSuccessStatus: 200
};

// Create CORS middleware
export const corsMiddleware = cors(corsOptions);

// Custom CORS error handler middleware
export const corsErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err && err.message && err.message.includes('not allowed by CORS policy')) {
    SystemLogger.log('warn', 'CORS request blocked', {
      req,
      metadata: {
        origin: req.headers.origin,
        host: req.headers.host,
        method: req.method,
        path: req.path,
      }
    });
    
    res.setHeader('Vary', 'Origin');
    sendErrorResponse(res, ERROR_CODES.AUTHORIZATION_ERROR, 'Origin not allowed by CORS policy');
    return;
  }
  
  next(err);
};

// Debug function to log CORS configuration
export const logCorsConfig = () => {
  console.log('CORS Configuration:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- CORS_ORIGIN env:', process.env.CORS_ORIGIN || 'Not set, using defaults.');
  console.log('- Allowed origins:', getAllowedOrigins().map(o => o.toString()));
  console.log('- Credentials:', corsOptions.credentials);
  console.log('- Methods:', corsOptions.methods);
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; img-src 'self' data: blob: *; connect-src 'self' *; font-src 'self' data: *; media-src 'self' data: blob: *;");
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};
