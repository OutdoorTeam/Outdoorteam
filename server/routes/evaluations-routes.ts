/**
 * API Routes: Evaluations
 * Sistema de evaluaciones: IMC, PARQ+, IPAQ, PSS-10, WHOQOL-BREF
 */

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// GET /api/evaluations - Get user's evaluations
// ============================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let query = supabase
      .from('evaluations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching evaluations:', error);
      return res.status(500).json({ error: 'Failed to fetch evaluations' });
    }

    res.json(data || []);

  } catch (error) {
    console.error('Error in /api/evaluations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// POST /api/evaluations - Create new evaluation
// ============================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type, data: evalData, interpretation } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!type || !evalData) {
      return res.status(400).json({ error: 'Type and data are required' });
    }

    const validTypes = ['imc', 'parq', 'ipaq', 'pss10', 'whoqol'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid evaluation type' });
    }

    const { data: evaluation, error } = await supabase
      .from('evaluations')
      .insert({
        user_id: userId,
        type,
        data: evalData,
        interpretation,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating evaluation:', error);
      return res.status(500).json({ error: 'Failed to create evaluation' });
    }

    res.status(201).json({
      message: 'Evaluation created successfully',
      evaluation,
    });

  } catch (error) {
    console.error('Error in POST /api/evaluations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// GET /api/evaluations/latest - Get latest evaluation by type
// ============================================================================

router.get('/latest', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching latest evaluation:', error);
      return res.status(500).json({ error: 'Failed to fetch evaluation' });
    }

    if (!data) {
      return res.status(404).json({ error: 'No evaluation found' });
    }

    res.json(data);

  } catch (error) {
    console.error('Error in /api/evaluations/latest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Helper: Calculate IMC
// ============================================================================

router.post('/calculate-imc', async (req: Request, res: Response) => {
  try {
    const { weight, height } = req.body;

    if (!weight || !height) {
      return res.status(400).json({ error: 'Weight and height are required' });
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum) || heightNum === 0) {
      return res.status(400).json({ error: 'Invalid weight or height values' });
    }

    const imc = weightNum / (heightNum * heightNum);

    let category = '';
    let recommendation = '';

    if (imc < 18.5) {
      category = 'Bajo peso';
      recommendation = 'Consulta con un nutricionista para alcanzar un peso saludable.';
    } else if (imc < 25) {
      category = 'Peso normal';
      recommendation = '¡Excelente! Mantén tu estilo de vida saludable.';
    } else if (imc < 30) {
      category = 'Sobrepeso';
      recommendation = 'Considera aumentar tu actividad física y mejorar tu alimentación.';
    } else if (imc < 35) {
      category = 'Obesidad I';
      recommendation = 'Es importante consultar con un médico y nutricionista.';
    } else if (imc < 40) {
      category = 'Obesidad II';
      recommendation = 'Se recomienda atención médica especializada.';
    } else {
      category = 'Obesidad III';
      recommendation = 'Se requiere atención médica inmediata.';
    }

    res.json({
      imc: Math.round(imc * 10) / 10,
      category,
      recommendation,
    });

  } catch (error) {
    console.error('Error calculating IMC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
