/**
 * API Routes: Activities Catalog
 * Catálogo de 50+ actividades con METs para Puntos de Vitalidad
 */

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/activities
 * Obtener catálogo de actividades
 * Query params:
 *  - category: filtrar por categoría
 *  - search: buscar por nombre
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let query = supabase
      .from('activities_catalog')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }

    if (search && typeof search === 'string') {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return res.status(500).json({ error: 'Error al obtener actividades' });
    }

    // Agrupar por categoría
    const groupedByCategory: Record<string, any[]> = {};
    data.forEach((activity) => {
      if (!groupedByCategory[activity.category]) {
        groupedByCategory[activity.category] = [];
      }
      groupedByCategory[activity.category].push(activity);
    });

    res.json({
      activities: data,
      groupedByCategory,
      total: data.length,
    });
  } catch (error) {
    console.error('Error in GET /api/activities:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/activities/categories
 * Obtener lista de categorías disponibles
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('activities_catalog')
      .select('category')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }

    const uniqueCategories = [...new Set(data.map((item) => item.category))];

    const categoryLabels: Record<string, string> = {
      hogar: 'Hogar',
      transporte: 'Transporte',
      trabajo: 'Trabajo',
      recreacion: 'Recreación',
      ejercicio: 'Ejercicio',
    };

    const categoriesWithLabels = uniqueCategories.map((cat) => ({
      value: cat,
      label: categoryLabels[cat] || cat,
    }));

    res.json({ categories: categoriesWithLabels });
  } catch (error) {
    console.error('Error in GET /api/activities/categories:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/activities/register
 * Registrar una actividad completada por el usuario
 * Body: {
 *   activity_id: number,
 *   duration_minutes: number,
 *   date?: string (YYYY-MM-DD)
 * }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { activity_id, duration_minutes, date } = req.body;

    if (!activity_id || !duration_minutes) {
      return res.status(400).json({ error: 'activity_id y duration_minutes son requeridos' });
    }

    if (duration_minutes <= 0 || duration_minutes > 480) {
      return res.status(400).json({ error: 'Duración inválida (debe estar entre 1 y 480 minutos)' });
    }

    // Obtener la actividad del catálogo
    const { data: activity, error: activityError } = await supabase
      .from('activities_catalog')
      .select('*')
      .eq('id', activity_id)
      .single();

    if (activityError || !activity) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Calcular Puntos de Vitalidad: (METs × minutos) / 2
    const totalMets = activity.mets * duration_minutes;
    const vitalityPoints = Math.floor(totalMets / 2);

    const activityDate = date || new Date().toISOString().split('T')[0];

    // Registrar la actividad
    const { data: userActivity, error: insertError } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_id: activity.id,
        activity_name: activity.name,
        duration_minutes,
        mets_value: activity.mets,
        vitality_points_earned: vitalityPoints,
        date: activityDate,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error registering activity:', insertError);
      return res.status(500).json({ error: 'Error al registrar actividad' });
    }

    // Actualizar daily_vitality
    const { data: dailyVitality, error: dailyError } = await supabase
      .from('daily_vitality')
      .select('*')
      .eq('user_id', userId)
      .eq('date', activityDate)
      .single();

    const currentExtraPoints = dailyVitality?.extra_activities_points || 0;
    const currentMainPoints = dailyVitality?.main_activities_points || 0;

    const newExtraPoints = currentExtraPoints + vitalityPoints;
    const newTotalPoints = currentMainPoints + newExtraPoints;

    if (dailyError) {
      // Crear registro si no existe
      await supabase.from('daily_vitality').insert({
        user_id: userId,
        date: activityDate,
        extra_activities_points: vitalityPoints,
        total_points: vitalityPoints,
      });
    } else {
      // Actualizar registro existente
      await supabase
        .from('daily_vitality')
        .update({
          extra_activities_points: newExtraPoints,
          total_points: newTotalPoints,
        })
        .eq('user_id', userId)
        .eq('date', activityDate);
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
        total_vitality_points: (user?.total_vitality_points || 0) + vitalityPoints,
      })
      .eq('id', userId);

    res.json({
      success: true,
      activity: userActivity,
      vitality_points_earned: vitalityPoints,
      message: `¡Ganaste ${vitalityPoints} Puntos de Vitalidad!`,
    });
  } catch (error) {
    console.error('Error in POST /api/activities/register:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/activities/history
 * Obtener historial de actividades del usuario
 * Query params:
 *  - date: fecha específica (YYYY-MM-DD)
 *  - from: fecha inicio (YYYY-MM-DD)
 *  - to: fecha fin (YYYY-MM-DD)
 *  - limit: número de resultados
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { date, from, to, limit } = req.query;

    let query = supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
      console.error('Error fetching activity history:', error);
      return res.status(500).json({ error: 'Error al obtener historial' });
    }

    res.json({ activities: data, total: data.length });
  } catch (error) {
    console.error('Error in GET /api/activities/history:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/activities/history/:id
 * Eliminar una actividad del historial
 */
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { id } = req.params;

    // Obtener la actividad antes de eliminarla
    const { data: activity, error: fetchError } = await supabase
      .from('user_activities')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !activity) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Eliminar la actividad
    const { error: deleteError } = await supabase
      .from('user_activities')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting activity:', deleteError);
      return res.status(500).json({ error: 'Error al eliminar actividad' });
    }

    // Restar los puntos de daily_vitality
    const { data: dailyVitality } = await supabase
      .from('daily_vitality')
      .select('*')
      .eq('user_id', userId)
      .eq('date', activity.date)
      .single();

    if (dailyVitality) {
      const newExtraPoints = Math.max(0, dailyVitality.extra_activities_points - activity.vitality_points_earned);
      const newTotalPoints = Math.max(0, dailyVitality.total_points - activity.vitality_points_earned);

      await supabase
        .from('daily_vitality')
        .update({
          extra_activities_points: newExtraPoints,
          total_points: newTotalPoints,
        })
        .eq('user_id', userId)
        .eq('date', activity.date);
    }

    // Restar del total del usuario
    const { data: user } = await supabase
      .from('users')
      .select('total_vitality_points')
      .eq('id', userId)
      .single();

    if (user) {
      await supabase
        .from('users')
        .update({
          total_vitality_points: Math.max(0, (user.total_vitality_points || 0) - activity.vitality_points_earned),
        })
        .eq('id', userId);
    }

    res.json({ success: true, message: 'Actividad eliminada correctamente' });
  } catch (error) {
    console.error('Error in DELETE /api/activities/history/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
