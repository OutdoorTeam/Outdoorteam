import { Router, Request, Response } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

const resolveSubscriptionPlanId = async (planIdentifier: string | null | undefined) => {
  if (!planIdentifier || !db) return null;

  const directMatch = await db
    .selectFrom('subscription_plans')
    .select('id')
    .where('id', '=', String(planIdentifier))
    .executeTakeFirst();

  if (directMatch) {
    return directMatch.id;
  }

  const nameMatch = await db
    .selectFrom('subscription_plans')
    .select('id')
    .where('name', '=', String(planIdentifier))
    .executeTakeFirst();

  return nameMatch ? nameMatch.id : null;
};

const booleanFromFeature = (value: unknown, fallback: boolean = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return Boolean(value);
};

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
      .select('id')
      .where('id', '=', user.id)
      .executeTakeFirst();

    const metadata = user.raw_user_meta_data || {};
    const features = metadata.features || {};

    const hasTrainingAccess = booleanFromFeature(features.training ?? features.training_enabled);
    const hasNutritionAccess = booleanFromFeature(features.nutrition ?? features.nutrition_enabled);
    const hasPauseAccess = booleanFromFeature(features.active_breaks ?? features.pause ?? features.breaks);
    const hasMeditationAccess = booleanFromFeature(features.meditation ?? features.meditation_enabled);

    const subscriptionIdentifier =
      metadata.subscription_plan_id ||
      metadata.subscription_plan ||
      metadata.plan_id ||
      metadata.plan ||
      metadata.plan_type ||
      user.plan_type;

    const subscriptionPlanId = await resolveSubscriptionPlanId(subscriptionIdentifier);

    const fullName = metadata.full_name || user.user_metadata?.full_name || metadata.name || user.email;
    const displayName = metadata.name || fullName;
    const profilePictureUrl =
      metadata.profile_picture_url ||
      metadata.avatar_url ||
      user.user_metadata?.avatar_url ||
      null;

    const updateData = {
      email: user.email,
      full_name: fullName,
      name: displayName,
      profile_picture_url: profilePictureUrl,
      subscription_plan_id: subscriptionPlanId,
      is_admin: booleanFromFeature(metadata.is_admin, false),
      is_active: metadata.is_active === false ? false : true,
      has_training_access: hasTrainingAccess,
      has_nutrition_access: hasNutritionAccess,
      has_pause_access: hasPauseAccess,
      has_meditation_access: hasMeditationAccess,
      health_assessment_results: metadata.health_assessment_results || null,
    };

    if (existingUser) {
      await db
        .updateTable('users')
        .set(updateData)
        .where('id', '=', user.id)
        .execute();
    } else {
      await db
        .insertInto('users')
        .values({
          id: user.id,
          ...updateData,
          created_at: new Date(),
          puntos: metadata.puntos ?? 0,
          pasos: metadata.pasos ?? 0,
          ranking_puntos: metadata.ranking_puntos ?? null,
          ranking_pasos: metadata.ranking_pasos ?? null,
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
