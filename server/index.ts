import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { setupStaticServing } from './static-serve.js';
import { db } from './database.js';
import DailyResetScheduler from './scheduler.js';
import NotificationScheduler from './services/notification-scheduler.js';
import statsRoutes from './routes/stats-routes.js';
import userStatsRoutes from './routes/user-stats-routes.js';
import notificationRoutes from './routes/notification-routes.js';
import nutritionPlanRoutes from './routes/nutrition-plan-routes.js';
import trainingPlanRoutes from './routes/training-plan-routes.js';
import trainingScheduleRoutes from './routes/training-schedule-routes.js';
import userManagementRoutes from './routes/user-management-routes.js';
import userGoalsRoutes from './routes/user-goals-routes.js';
import plansManagementRoutes from './routes/plans-management-routes.js';
import dailyHabitsRoutes from './routes/daily-habits-routes.js';
import dailyNotesRoutes from './routes/daily-notes-routes.js';
import myGoalsRoutes from './routes/my-goals-routes.js';
import apiRoutes from './routes/api-routes.js';
import authRoutes from './routes/auth-routes.js';
import avatarRoutes from './routes/avatar-routes.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';
import { ERROR_CODES, sendErrorResponse } from './utils/validation.js';
import { SystemLogger } from './utils/logging.js';
import { globalApiLimit, burstLimit } from './middleware/rate-limiter.js';
import { corsMiddleware, corsErrorHandler, securityHeaders, logCorsConfig } from './config/cors.js';
import { supabaseAdmin } from './supabase.js'; // (se usa indirectamente en auth)

dotenv.config();

const app = express();

// --- Environment Variable Checks ---
const requiredEnv = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE', 'SUPABASE_JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => {
  const value = process.env[key];
  return !value || String(value).trim() === '';
});
const isStrictEnv = String(process.env.STRICT_ENV).toLowerCase() === 'true';

if (missingEnv.length && isStrictEnv) {
  console.error('Missing required envs:', missingEnv.join(', '));
  // Note: in production we would exit with code 1 here.
} else if (missingEnv.length) {
  console.warn('[WARN] Missing envs (continuing due to STRICT_ENV!=true):', missingEnv.join(', '));
}

const areCoreServicesAvailable = missingEnv.length === 0;

// Enable trust proxy for deployment platforms
app.set('trust proxy', true);

// Initialize schedulers
let resetScheduler: DailyResetScheduler | null = null;
let notificationScheduler: NotificationScheduler | null = null;

const checkVapidConfiguration = () => {
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

  const isConfigured =
    !!(VAPID_PUBLIC_KEY &&
      VAPID_PRIVATE_KEY &&
      VAPID_PRIVATE_KEY !== 'YOUR_PRIVATE_KEY_HERE' &&
      VAPID_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY_HERE' &&
      VAPID_PRIVATE_KEY.length >= 32 &&
      VAPID_PUBLIC_KEY.length >= 32);

  if (isConfigured) {
    console.log('✅ VAPID keys are configured correctly');
  }
  return isConfigured;
};

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Security headers first
app.use(securityHeaders);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply CORS to all routes
app.use(corsMiddleware);
app.use(corsErrorHandler);

// Apply rate limiting
if (areCoreServicesAvailable) {
  app.use('/api/', globalApiLimit);
  app.use('/api/', burstLimit);
}

// Health check endpoint (always available)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Debug endpoint for environment variables (always available)
app.get('/debug/env', (_req, res) => {
  const envStatus = requiredEnv.reduce((acc, key) => {
    acc[key] = process.env[key] ? 'SET' : 'NOT SET';
    return acc;
  }, {} as Record<string, string>);
  res.json({ envStatus, isStrictEnv });
});

// --- Conditional Route and Middleware Mounting ---
if (areCoreServicesAvailable) {
  // System logs endpoint for debugging (admin only)
  app.get('/api/system-logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { level, limit = 100 } = req.query;
      let query = db!
        .selectFrom('database_alerts')
        .select(['id', 'severity', 'message', 'details', 'created_at'])
        .orderBy('created_at', 'desc')
        .limit(parseInt(String(limit)));

      if (level) {
        query = query.where('severity', '=', String(level));
      }
      const logs = await query.execute();
      res.json(logs);
    } catch (error) {
      console.error('Error fetching system logs:', error);
      const userId = (req as any).user?.id ?? null;
      await SystemLogger.logCriticalError('System logs fetch error', error as Error, { userId });
      sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error fetching system logs');
    }
  });

  // Simple root endpoint
  app.get('/api/status', async (_req, res) => {
    try {
      const latestAlerts = await db!
        .selectFrom('database_alerts')
        .select(['id', 'severity as level', 'message', 'created_at'])
        .orderBy('created_at', 'desc')
        .limit(20)
        .execute();

      res.json({
        message: 'Outdoor Team API Server',
        status: 'running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        alerts: latestAlerts,
      });
    } catch (error) {
      console.error('Error fetching latest alerts for status endpoint:', error);
      sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error fetching status data');
    }
  });

  const formatUserResponse = (user: any) => {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name ?? user.name ?? '',
      role: user.is_admin ? 'admin' : 'user',
      plan_type: user.subscription_plan_id,
      created_at: user.created_at,
      is_active: Boolean(user.is_active),
      features: {
        habits: Boolean(user.has_training_access || user.has_nutrition_access || user.has_pause_access || user.has_meditation_access),
        training: Boolean(user.has_training_access),
        nutrition: Boolean(user.has_nutrition_access),
        meditation: Boolean(user.has_meditation_access),
        active_breaks: Boolean(user.has_pause_access),
      },
    };
  };

  // Mount all API routes
  app.use('/api', statsRoutes);
  app.use('/api', userStatsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/nutrition', nutritionPlanRoutes);
  app.use('/api/training', trainingPlanRoutes);
  app.use('/api/training-schedule', trainingScheduleRoutes);
  app.use('/api/admin', userManagementRoutes);
  app.use('/api/admin', userGoalsRoutes);
  app.use('/api/admin', plansManagementRoutes);
  app.use('/api', dailyHabitsRoutes);
  app.use('/api/daily-notes', dailyNotesRoutes);
  app.use('/api', myGoalsRoutes);
  app.use('/api', apiRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/avatar', avatarRoutes);

  // Endpoint de subida de archivos deshabilitado en este esquema
  app.post('/api/user-files/upload', (_req: Request, res: Response): void => {
    res.status(501).json({ message: 'User files storage not implemented for current schema' });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res: express.Response) => {
    if (!req.user) {
      return sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'Not authenticated');
    }
    res.json(formatUserResponse(req.user));
  });
} else {
  console.warn('⚠️ Core services are unavailable due to missing environment variables. API endpoints are disabled.');
  app.use('/api', (_req, res) => {
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Server is not configured. Please check environment variables.');
  });
}

// Setup static serving for production
if (process.env.NODE_ENV === 'production') {
  setupStaticServing(app);
  console.log('🚀 Static file serving configured for production');
}

// 404 Handler
app.use((req, res, _next) => {
  if (req.path.startsWith('/api/')) {
    sendErrorResponse(res, ERROR_CODES.NOT_FOUND_ERROR, 'API endpoint not found');
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    const indexPath = path.join(process.cwd(), 'dist/public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'App not built. Missing index.html' });
    }
    return;
  }

  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  if (res.headersSent) {
    return next(error);
  }
  sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Internal server error');
});

export const startServer = async (port = 3001) => {
  try {
    console.log('🛠️ Starting server initialization...');
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
    console.log('📂 Current working directory:', process.cwd());

    if (areCoreServicesAvailable) {
      console.log('🔌 Testing database connection...');
      await db!.selectFrom('users').select('id').limit(1).execute();
      console.log('✅ Database connection established');

      if (process.env.ENABLE_SCHEDULERS === 'true') {
        console.log('⏰ Initializing daily reset scheduler...');
        resetScheduler = new DailyResetScheduler(db);
        await resetScheduler.initialize();
      } else {
        console.log('🛑 Schedulers are disabled (ENABLE_SCHEDULERS is not true).');
      }

      const vapidConfigured = checkVapidConfiguration();
      console.log('🔔 Initializing notification scheduler...');
      notificationScheduler = new NotificationScheduler();
    } else {
      console.warn('⚠️ Database and core services are not available. Server will run in a limited mode.');
    }

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
      logCorsConfig();

      if (notificationScheduler?.isVapidConfigured()) {
        console.log('🔔 Push notifications: Ready');
      } else {
        console.log('🔕 Push notifications: Disabled (VAPID keys not configured)');
      }

      console.log('✅ Server startup completed successfully');
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️ ${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('🛑 HTTP server closed');
        if (resetScheduler) resetScheduler.stop();
        if (db) {
          try {
            await db.destroy();
            console.log('✅ Database connection closed');
          } catch (e) {
            console.error('Error closing database connection:', e);
          }
        }
        console.log('👋 Graceful shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('🚨 Failed to start server:', error);
    process.exit(1);
  }
};

// ▶️ Guard de ejecución (CommonJS)
declare const require: NodeRequire; // para TS
declare const module: NodeModule;

if (typeof require !== 'undefined' && require.main === module) {
  const port = parseInt(process.env.PORT || '3001', 10);
  startServer(port);
}

export default app;
