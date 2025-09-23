
import { Router } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

// This route is now a webhook to sync Supabase user to our public.users table
router.post('/sync-user', async (req, res) => {
  // A simple auth mechanism for the webhook
  if (req.headers['x-internal-secret'] !== process.env.INTERNAL_API_KEY) {
    return res.status(401).send('Unauthorized');
  }

  const { user } = req.body;

  if (!user || !user.id || !user.email) {
    return res.status(400).send('Invalid user data');
  }

  try {
    const existingUser = await db
      .selectFrom('users')
      .where('email', '=', user.email)
      .select('id')
      .executeTakeFirst();

    const userData = {
      email: user.email,
      full_name: user.user_metadata?.full_name || 'New User',
      role: user.user_metadata?.role || 'user',
      plan_type: user.user_metadata?.plan_type || null,
      is_active: 1,
      features_json: JSON.stringify(user.user_metadata?.features || {}),
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
router.post('/change-password', authenticateToken, async (req: any, res) => {
  if (!supabaseAdmin) {
    return sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Auth service is not configured.');
  }
  try {
    const userId = req.user.supabase_id; // Use Supabase user ID
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
