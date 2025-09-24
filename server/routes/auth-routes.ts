import { Router, Request, Response } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

// This route is a webhook to sync a new Supabase user to our public.users table
router.post('/sync-user', async (req: Request, res: Response): Promise<void> => {
  if (!db) {
    res.status(503).send('Database service unavailable');
    return;
  }
  // A simple auth mechanism for the webhook, can be improved
  if (req.headers['x-internal-secret'] !== process.env.INTERNAL_API_KEY) {
    res.status(401).send('Unauthorized');
    return;
  }

  const { record: user } = req.body; // Supabase webhook sends user data in `record`

  if (!user || !user.id || !user.email) {
    res.status(400).send('Invalid user data');
    return;
  }

  try {
    const existingUser = await db
      .selectFrom('users')
      .where('id', '=', user.id)
      .select('id')
      .executeTakeFirst();

    const userData = {
      id: user.id, // Use Supabase UUID as our primary key
      email: user.email,
      full_name: user.raw_user_meta_data?.full_name || 'New User',
      role: user.raw_user_meta_data?.role || 'user',
      plan_type: user.raw_user_meta_data?.plan_type || null,
      is_active: 1,
      features_json: JSON.stringify(user.raw_user_meta_data?.features || {}),
      updated_at: new Date(),
    };

    if (existingUser) {
      await db
        .updateTable('users')
        .set(userData)
        .where('id', '=', existingUser.id)
        .execute();
    } else {
      await db
        .insertInto('users')
        .values({
          ...userData,
          created_at: new Date(),
        })
        .execute();
    }

    res.status(200).json({ message: 'User synced successfully' });
  } catch (error) {
    console.error('Error syncing user:', error);
    await SystemLogger.logCriticalError('User sync webhook error', error as Error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password for authenticated user
router.post('/change-password', authenticateToken, async (req: any, res: Response): Promise<void> => {
  if (!supabaseAdmin) {
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Auth service is not configured.');
    return;
  }
  try {
    const userId = req.user.id; // Use user ID from our token
    const { password } = req.body;

    if (!password || password.length < 8) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Password must be at least 8 characters long');
      return;
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });

    if (error) {
      throw error;
    }

    await SystemLogger.log('info', 'User changed password', { userId: req.user.id });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    await SystemLogger.logCriticalError('Password change error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error changing password');
  }
});

export default router;