import { Router } from 'express';
const router = Router();

router.get('/', async (_req, res) => {
  // Lista simple de nutrition_plans (tabla existe pero sin user_id/version/status)
  res.json({ items: [] });
});

router.all('/*', (_req, res) => {
  res.status(501).json({ message: 'Nutrition plan draft/version workflow not implemented for current schema' });
});

export default router;
