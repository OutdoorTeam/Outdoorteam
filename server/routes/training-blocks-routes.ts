/**
 * API Routes: Training Blocks
 * Bloques de entrenamiento de 10 minutos
 */

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/training-blocks
 * Obtener bloques de entrenamiento
 * Query params:
 *  - type: filtrar por tipo (hiit, strength, aerobic, seniors, stretching, relaxation)
 *  - level: filtrar por nivel mínimo de actividad (1, 2, 3)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type, level } = req.query;

    let query = supabase
      .from('training_blocks')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (type && typeof type === 'string') {
      query = query.eq('type', type);
    }

    // Filtrar por nivel de actividad del usuario si se proporciona
    if (level && typeof level === 'string') {
      const levelNum = parseInt(level);
      query = query.lte('min_activity_level', levelNum);
    } else if (userId) {
      // Si no se especifica nivel, obtener el nivel del usuario
      const { data: user } = await supabase
        .from('users')
        .select('activity_level')
        .eq('id', userId)
        .single();

      if (user) {
        query = query.lte('min_activity_level', user.activity_level || 1);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching training blocks:', error);
      return res.status(500).json({ error: 'Error al obtener bloques de entrenamiento' });
    }

    // Agrupar por tipo
    const groupedByType: Record<string, any[]> = {};
    data.forEach((block) => {
      if (!groupedByType[block.type]) {
        groupedByType[block.type] = [];
      }
      groupedByType[block.type].push(block);
    });

    res.json({
      blocks: data,
      groupedByType,
      total: data.length,
    });
  } catch (error) {
    console.error('Error in GET /api/training-blocks:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/training-blocks/types
 * Obtener lista de tipos de bloques disponibles
 */
router.get('/types', async (req: Request, res: Response) => {
  try {
    const types = [
      { value: 'hiit', label: 'HIIT', points: 3.0, intensity: 'Alta', icon: '🔥' },
      { value: 'strength', label: 'Fuerza', points: 2.5, intensity: 'Media-Alta', icon: '💪' },
      { value: 'aerobic', label: 'Aeróbico', points: 2.0, intensity: 'Media', icon: '🏃' },
      { value: 'seniors', label: 'Adultos Mayores', points: 1.5, intensity: 'Baja-Media', icon: '🚶' },
      { value: 'stretching', label: 'Estiramientos', points: 1.0, intensity: 'Baja', icon: '🧘' },
      { value: 'relaxation', label: 'Relajación', points: 1.0, intensity: 'Muy Baja', icon: '☮️' },
    ];

    res.json({ types });
  } catch (error) {
    console.error('Error in GET /api/training-blocks/types:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/training-blocks/:id
 * Obtener un bloque de entrenamiento específico
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('training_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Bloque de entrenamiento no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in GET /api/training-blocks/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/training-blocks/complete
 * Registrar la finalización de un bloque de entrenamiento
 * Body: {
 *   block_id: number,
 *   date?: string (YYYY-MM-DD)
 * }
 */
router.post('/complete', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { block_id, date } = req.body;

    if (!block_id) {
      return res.status(400).json({ error: 'block_id es requerido' });
    }

    // Obtener el bloque
    const { data: block, error: blockError } = await supabase
      .from('training_blocks')
      .select('*')
      .eq('id', block_id)
      .single();

    if (blockError || !block) {
      return res.status(404).json({ error: 'Bloque de entrenamiento no encontrado' });
    }

    const sessionDate = date || new Date().toISOString().split('T')[0];

    // Registrar la sesión
    const { data: session, error: insertError } = await supabase
      .from('user_training_sessions')
      .insert({
        user_id: userId,
        block_id: block.id,
        block_title: block.title,
        vitality_points_earned: block.vitality_points,
        date: sessionDate,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error completing training block:', insertError);
      return res.status(500).json({ error: 'Error al completar bloque' });
    }

    // Actualizar daily_vitality
    const { data: dailyVitality, error: dailyError } = await supabase
      .from('daily_vitality')
      .select('*')
      .eq('user_id', userId)
      .eq('date', sessionDate)
      .single();

    const currentMainPoints = dailyVitality?.main_activities_points || 0;
    const currentExtraPoints = dailyVitality?.extra_activities_points || 0;

    // El primer bloque del día cuenta como actividad principal (2 PV)
    // Bloques adicionales cuentan como extras
    let newMainPoints = currentMainPoints;
    let newExtraPoints = currentExtraPoints;

    if (!dailyVitality?.training_block_completed) {
      // Primer bloque del día: 2 PV como actividad principal
      newMainPoints += 2;
      newExtraPoints += Math.max(0, block.vitality_points - 2);
    } else {
      // Bloques adicionales: todos los puntos van a extras
      newExtraPoints += block.vitality_points;
    }

    const newTotalPoints = newMainPoints + newExtraPoints;

    if (dailyError) {
      // Crear registro si no existe
      await supabase.from('daily_vitality').insert({
        user_id: userId,
        date: sessionDate,
        training_block_completed: true,
        main_activities_points: 2,
        extra_activities_points: Math.max(0, block.vitality_points - 2),
        total_points: block.vitality_points,
      });
    } else {
      // Actualizar registro existente
      await supabase
        .from('daily_vitality')
        .update({
          training_block_completed: true,
          main_activities_points: newMainPoints,
          extra_activities_points: newExtraPoints,
          total_points: newTotalPoints,
        })
        .eq('user_id', userId)
        .eq('date', sessionDate);
    }

    // Actualizar total_vitality_points en users
    const { data: user } = await supabase
      .from('users')
      .select('total_vitality_points')
      .eq('id', userId)
      .single();

    await supabase
      .from('users')
      .update({
        total_vitality_points: (user?.total_vitality_points || 0) + block.vitality_points,
      })
      .eq('id', userId);

    res.json({
      success: true,
      session,
      vitality_points_earned: block.vitality_points,
      message: `¡Excelente! Ganaste ${block.vitality_points} Puntos de Vitalidad`,
    });
  } catch (error) {
    console.error('Error in POST /api/training-blocks/complete:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/training-blocks/history
 * Obtener historial de sesiones de entrenamiento del usuario
 * Query params:
 *  - date: fecha específica (YYYY-MM-DD)
 *  - from: fecha inicio (YYYY-MM-DD)
 *  - to: fecha fin (YYYY-MM-DD)
 *  - limit: número de resultados
 */
router.get('/sessions/history', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { date, from, to, limit } = req.query;

    let query = supabase
      .from('user_training_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (date && typeof date === 'string') {
      query = query.eq('date', date);
    }

    if (from && typeof from === 'string') {
      query = query.gte('date', from);
    }

    if (to && typeof to === 'string') {
      query = query.lte('date', to);
    }

    if (limit && typeof limit === 'string') {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching training history:', error);
      return res.status(500).json({ error: 'Error al obtener historial' });
    }

    res.json({ sessions: data, total: data.length });
  } catch (error) {
    console.error('Error in GET /api/training-blocks/sessions/history:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/training-blocks/stats
 * Obtener estadísticas de entrenamiento del usuario
 */
router.get('/sessions/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Total de sesiones
    const { data: allSessions, error: allError } = await supabase
      .from('user_training_sessions')
      .select('*')
      .eq('user_id', userId);

    if (allError) {
      console.error('Error fetching training stats:', allError);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }

    // Sesiones del mes actual
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];

    const { data: monthSessions, error: monthError } = await supabase
      .from('user_training_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', firstDayStr);

    if (monthError) {
      console.error('Error fetching month stats:', monthError);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }

    // Calcular estadísticas
    const totalSessions = allSessions.length;
    const totalVitalityPoints = allSessions.reduce(
      (sum, session) => sum + (session.vitality_points_earned || 0),
      0
    );

    const monthSessionsCount = monthSessions.length;
    const monthVitalityPoints = monthSessions.reduce(
      (sum, session) => sum + (session.vitality_points_earned || 0),
      0
    );

    // Contar por tipo de bloque (basado en el título o vincular con training_blocks)
    const sessionsByType: Record<string, number> = {};
    allSessions.forEach((session) => {
      const title = session.block_title || 'Otro';
      sessionsByType[title] = (sessionsByType[title] || 0) + 1;
    });

    res.json({
      total_sessions: totalSessions,
      total_vitality_points: totalVitalityPoints,
      month_sessions: monthSessionsCount,
      month_vitality_points: monthVitalityPoints,
      sessions_by_type: sessionsByType,
    });
  } catch (error) {
    console.error('Error in GET /api/training-blocks/sessions/stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
