import { Router } from 'express';
import { db } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';

const router = Router();

const parsePrice = (value: unknown) => {
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (typeof numeric !== 'number' || Number.isNaN(numeric) || numeric < 0) {
    return null;
  }
  return numeric;
};

const normalizeFeatures = (rawFeatures: any, servicesIncluded: any): Record<string, unknown> => {
  if (rawFeatures && typeof rawFeatures === 'object' && !Array.isArray(rawFeatures)) {
    return rawFeatures;
  }
  if (Array.isArray(servicesIncluded)) {
    return servicesIncluded.reduce((acc: Record<string, boolean>, item: any) => {
      if (typeof item === 'string' && item.trim()) {
        acc[item.trim()] = true;
      }
      return acc;
    }, {});
  }
  return {};
};

const formatPlanResponse = (plan: any) => {
  const features = (plan.features && typeof plan.features === 'object') ? plan.features : {};
  const servicesIncluded = Array.isArray(plan.services_included)
    ? plan.services_included
    : Object.entries(features)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([key]) => key);

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: Number(plan.price),
    features,
    features_json: features,
    services_included: servicesIncluded,
    created_at: plan.created_at,
  };
};

// Get all plans (admin only)
router.get('/plans-management', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    console.log('Admin fetching all plans for management');

    const plans = await db
      .selectFrom('subscription_plans')
      .select(['id', 'name', 'price', 'description', 'features', 'created_at'])
      .orderBy('created_at', 'desc')
      .execute();

    const formattedPlans = plans.map(formatPlanResponse);

    console.log('Plans fetched for management:', formattedPlans.length);
    res.json(formattedPlans);
  } catch (error) {
    console.error('Error fetching plans for management:', error);
    await SystemLogger.logCriticalError('Plans management fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener planes');
  }
});

// Update plan (admin only)
router.put('/plans-management/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, features, features_json, services_included } = req.body;

    console.log('Admin updating plan:', id, 'with data:', { name, price });

    if (!name?.trim()) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'El nombre del plan es requerido');
      return;
    }

    const normalizedPrice = parsePrice(price);
    if (normalizedPrice === null) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'El precio debe ser un número válido');
      return;
    }

    const planFeatures = normalizeFeatures(features ?? features_json, services_included);

    const updatedPlan = await db
      .updateTable('subscription_plans')
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        price: normalizedPrice,
        features: planFeatures,
      })
      .where('id', '=', String(id))
      .returning(['id', 'name', 'price', 'description', 'features', 'created_at'])
      .executeTakeFirst();

    if (!updatedPlan) {
      sendErrorResponse(res, ERROR_CODES.NOT_FOUND_ERROR, 'Plan no encontrado');
      return;
    }

    await SystemLogger.log('info', 'Plan updated', {
      userId: req.user.id,
      metadata: { plan_id: String(id), name, price: normalizedPrice },
    });

    const formattedPlan = formatPlanResponse(updatedPlan);

    console.log('Plan updated successfully:', formattedPlan.id);
    res.json(formattedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    await SystemLogger.logCriticalError('Plan update error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al actualizar plan');
  }
});

// Create new plan (admin only)
router.post('/plans-management', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { name, description, price, features, features_json, services_included } = req.body;

    console.log('Admin creating new plan:', { name, price });

    if (!name?.trim()) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'El nombre del plan es requerido');
      return;
    }

    const normalizedPrice = parsePrice(price);
    if (normalizedPrice === null) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'El precio debe ser un número válido');
      return;
    }

    const planFeatures = normalizeFeatures(features ?? features_json, services_included);

    const now = new Date();
    const newPlan = await db
      .insertInto('subscription_plans')
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        price: normalizedPrice,
        features: planFeatures,
        created_at: now,
      })
      .returning(['id', 'name', 'price', 'description', 'features', 'created_at'])
      .executeTakeFirst();

    if (!newPlan) {
      sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al crear el plan');
      return;
    }

    await SystemLogger.log('info', 'Plan created', {
      userId: req.user.id,
      metadata: { plan_id: newPlan.id, name, price: normalizedPrice },
    });

    const formattedPlan = formatPlanResponse(newPlan);

    console.log('Plan created successfully:', formattedPlan.id);
    res.status(201).json(formattedPlan);
  } catch (error) {
    console.error('Error creating plan:', error);
    await SystemLogger.logCriticalError('Plan creation error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al crear plan');
  }
});

// Delete plan (admin only)
router.delete('/plans-management/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;

    console.log('Admin deleting plan:', id);

    const usersOnPlan = await db
      .selectFrom('users')
      .select('id')
      .where('subscription_plan_id', '=', String(id))
      .limit(1)
      .execute();

    if (usersOnPlan.length > 0) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'No se puede eliminar un plan que está siendo usado por usuarios');
      return;
    }

    const planRecord = await db
      .selectFrom('subscription_plans')
      .select(['id', 'name'])
      .where('id', '=', String(id))
      .executeTakeFirst();

    if (!planRecord) {
      sendErrorResponse(res, ERROR_CODES.NOT_FOUND_ERROR, 'Plan no encontrado');
      return;
    }

    const entitlements = await db
      .selectFrom('entitlements')
      .select('user_id')
      .where('plan', '=', planRecord.name)
      .limit(1)
      .execute();

    if (entitlements.length > 0) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Plan asignado en entitlements, desvincular antes de eliminar');
      return;
    }

    const deletedPlan = await db
      .deleteFrom('subscription_plans')
      .where('id', '=', String(id))
      .returning(['id', 'name'])
      .executeTakeFirst();

    if (!deletedPlan) {
      sendErrorResponse(res, ERROR_CODES.NOT_FOUND_ERROR, 'Plan no encontrado');
      return;
    }

    await SystemLogger.log('info', 'Plan deleted', {
      userId: req.user.id,
      metadata: { plan_id: deletedPlan.id, name: deletedPlan.name },
    });

    console.log('Plan deleted successfully:', deletedPlan.id);
    res.status(200).json({ message: 'Plan eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    await SystemLogger.logCriticalError('Plan deletion error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al eliminar plan');
  }
});

export default router;
