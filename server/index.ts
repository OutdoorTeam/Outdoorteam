
import express from 'express';
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
import {
  ERROR_CODES,
  sendErrorResponse
} from './utils/validation.js';
import { SystemLogger } from './utils/logging.js';
import {
  globalApiLimit,
  burstLimit,
} from './middleware/rate-limiter.js';
import {
  corsMiddleware,
  corsErrorHandler,
  securityHeaders,
  logCorsConfig
} from './config/cors.js';
import { supabaseAdmin } from './supabase.js';

dotenv.config();

const app = express();

// Enable trust proxy for deployment platforms
app.set('trust proxy', true);

// Initialize schedulers
let resetScheduler: DailyResetScheduler | null = null;
let notificationScheduler: NotificationScheduler;

const checkVapidConfiguration = () => {
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

  const isConfigured = !!(VAPID_PUBLIC_KEY && 
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
app.use('/api/', globalApiLimit);
app.use('/api/', burstLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Debug endpoint for environment variables
app.get('/debug/env', (req, res) => {
  const requiredKeys = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE',
    'SUPABASE_JWT_SECRET',
    'DATABASE_URL',
  ];

  const envStatus = requiredKeys.reduce((acc, key) => {
    acc[key] = process.env[key] ? 'SET' : 'NOT SET';
    return acc;
  }, {} as Record<string, string>);

  res.json({
    message: 'Environment Variable Status',
    status: envStatus,
    featureFlags: {
      migrations: process.env.FEATURE_MIGRATIONS === 'true',
      seedDb: process.env.FEATURE_SEED_DB === 'true',
      instance: process.env.FEATURE_INSTANCE === 'true',
    },
  });
});

// System logs endpoint for debugging (admin only)
app.get('/api/system-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { level, limit = 100 } = req.query;
    let query = db
      .selectFrom('system_logs')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(parseInt(String(limit)));

    if (level) {
      query = query.where('level', '=', String(level));
    }
    const logs = await query.execute();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching system logs:', error);
    const userId = req.user?.id ?? null;
    await SystemLogger.logCriticalError('System logs fetch error', error as Error, { userId: Number(userId) });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error fetching system logs');
  }
});

// Simple root endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Outdoor Team API Server', 
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

const getUserFeatures = (featuresJson: string) => {
  try {
    return JSON.parse(featuresJson || '{}');
  } catch (error) {
    console.error('Error parsing features JSON:', error);
    return {};
  }
};

const formatUserResponse = (user: any) => {
  const features = getUserFeatures(user.features_json);
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    plan_type: user.plan_type,
    created_at: user.created_at,
    is_active: user.is_active,
    features: {
      habits: features.habits || false,
      training: features.training || false,
      nutrition: features.nutrition || false,
      meditation: features.meditation || false,
      active_breaks: features.active_breaks || false
    }
  };
};

// Mount routes
app.use('/api', statsRoutes);
app.use('/api', userStatsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', nutritionPlanRoutes);
app.use('/api', trainingPlanRoutes);
app.use('/api', trainingScheduleRoutes);
app.use('/api/admin', userManagementRoutes);
app.use('/api/admin', userGoalsRoutes);
app.use('/api/admin', plansManagementRoutes);
app.use('/api', dailyHabitsRoutes);
app.use('/api', dailyNotesRoutes);
app.use('/api', myGoalsRoutes);
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', avatarRoutes);

// File upload endpoint using Supabase Storage
app.post('/api/upload-user-file', authenticateToken, upload.single('file'), async (req: any, res) => {
  if (!supabaseAdmin) {
    return sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Storage service is not configured.');
  }
  if (!req.file) {
    return sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'No file uploaded.');
  }

  const { user_id, file_type } = req.body;
  const file = req.file;
  const timestamp = Date.now();
  const extension = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, extension);
  const fileName = `user_${user_id}/${file_type}_${timestamp}_${baseName}${extension}`;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from('user-files') // bucket name
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Save file metadata to our database
    const newFile = await db.insertInto('user_files').values({
      user_id: parseInt(user_id),
      filename: fileName,
      file_type,
      file_path: data.path,
      uploaded_by: req.user.id,
      created_at: new Date(),
    }).returningAll().executeTakeFirst();

    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    await SystemLogger.logCriticalError('Supabase upload error', error as Error, { userId: req.user.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Failed to upload file.');
  }
});


app.get('/api/auth/me', authenticateToken, (req: any, res: express.Response) => {
  if (!req.user) {
    return sendErrorResponse(res, ERROR_CODES.AUTHENTICATION_ERROR, 'Not authenticated');
  }
  res.json(formatUserResponse(req.user));
});

// Setup static serving for production
if (process.env.NODE_ENV === 'production') {
  setupStaticServing(app);
  console.log('📁 Static file serving configured for production');
}

// 404 Handler
app.use((req, res, next) => {
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
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  if (res.headersSent) {
    return next(error);
  }
  sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Internal server error');
});

export const startServer = async (port = 3001) => {
  try {
    console.log('🔄 Starting server initialization...');
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
    console.log('📁 Current working directory:', process.cwd());

    const requiredEnv = [
      'DATABASE_URL',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE',
      'SUPABASE_JWT_SECRET',
    ];
    const missingEnv = requiredEnv.filter(e => !process.env[e]);

    if (missingEnv.length > 0) {
      console.error('❌ Missing required environment variables:', missingEnv.join(', '));
      console.error('Please check your .env file and ensure all required variables are set.');
      process.exit(1);
    }

    console.log('🔌 Testing database connection...');
    await db.selectFrom('users').select('id').limit(1).execute();
    console.log('✅ Database connection established');

    console.log('🔄 Initializing daily reset scheduler...');
    resetScheduler = new DailyResetScheduler(db);
    await resetScheduler.initialize();

    const vapidConfigured = checkVapidConfiguration();

    console.log('🔔 Initializing notification scheduler...');
    notificationScheduler = new NotificationScheduler();

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
      logCorsConfig();
      
      if (vapidConfigured) {
        console.log('📱 Push notifications: Ready');
      } else {
        console.log('📱 Push notifications: Disabled (VAPID keys not configured)');
      }

      console.log('✅ Server startup completed successfully');
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        if (resetScheduler) resetScheduler.stop();
        try {
          await db.destroy();
          console.log('🗄️  Database connection closed');
        } catch (e) {
          console.error('Error closing database connection:', e);
        }
        console.log('✅ Graceful shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || '3001', 10);
  startServer(port);
}

export default app;
