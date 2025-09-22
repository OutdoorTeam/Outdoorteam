import { Router } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';

const router = Router();

// Function to calculate vitality level from weekly points
const calculateVitalityLevel = (weeklyPoints: number): number => {
  if (weeklyPoints >= 25) return 5; // Max vitality
  if (weeklyPoints >= 20) return 4;
  if (weeklyPoints >= 15) return 3;
  if (weeklyPoints >= 10) return 2;
  return 1; // Base vitality
};

// GET current user's avatar
router.get('/avatar', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching avatar for user:', userId);

    // Get weekly points to calculate vitality
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const weeklyData = await db
      .selectFrom('daily_habits')
      .select(db.fn.sum('daily_points').as('total_points'))
      .where('user_id', '=', userId)
      .where('date', '>=', weekStartStr)
      .executeTakeFirst();

    const weeklyPoints = Number(weeklyData?.total_points || 0);
    const vitalityLevel = calculateVitalityLevel(weeklyPoints);

    let avatar = await db
      .selectFrom('user_avatars')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!avatar) {
      // Create a default avatar if none exists
      avatar = await db
        .insertInto('user_avatars')
        .values({ user_id: userId, vitality_level: vitalityLevel })
        .returningAll()
        .executeTakeFirstOrThrow();
      console.log('Created default avatar for user:', userId);
    } else if (avatar.vitality_level !== vitalityLevel) {
      // Update vitality level if it has changed
      avatar = await db
        .updateTable('user_avatars')
        .set({ vitality_level: vitalityLevel, updated_at: new Date().toISOString() })
        .where('user_id', '=', userId)
        .returningAll()
        .executeTakeFirstOrThrow();
      console.log('Updated avatar vitality for user:', userId, 'to level', vitalityLevel);
    }

    res.json(avatar);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    await SystemLogger.logCriticalError('Avatar fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener el avatar');
  }
});

// PUT update user's avatar
router.put('/avatar', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      gender,
      skin_tone,
      hair_style,
      hair_color,
      shirt_style,
      shirt_color,
      pants_style,
      pants_color,
      accessory,
    } = req.body;

    console.log('Updating avatar for user:', userId, 'with data:', req.body);

    const updateData: any = { updated_at: new Date().toISOString() };
    if (gender) updateData.gender = gender;
    if (skin_tone) updateData.skin_tone = skin_tone;
    if (hair_style) updateData.hair_style = hair_style;
    if (hair_color) updateData.hair_color = hair_color;
    if (shirt_style) updateData.shirt_style = shirt_style;
    if (shirt_color) updateData.shirt_color = shirt_color;
    if (pants_style) updateData.pants_style = pants_style;
    if (pants_color) updateData.pants_color = pants_color;
    if (accessory) updateData.accessory = accessory;

    const updatedAvatar = await db
      .updateTable('user_avatars')
      .set(updateData)
      .where('user_id', '=', userId)
      .returningAll()
      .executeTakeFirst();

    if (!updatedAvatar) {
      sendErrorResponse(res, ERROR_CODES.NOT_FOUND_ERROR, 'Avatar no encontrado para el usuario');
      return;
    }

    await SystemLogger.log('info', 'Avatar updated', { userId, metadata: req.body });
    res.json(updatedAvatar);
  } catch (error) {
    console.error('Error updating avatar:', error);
    await SystemLogger.logCriticalError('Avatar update error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al actualizar el avatar');
  }
});

export default router;
