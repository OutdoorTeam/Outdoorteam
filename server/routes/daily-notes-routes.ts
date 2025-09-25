import { Router } from 'express';
const router = Router();

router.all('*', (_req, res) => {
  res.status(501).json({ message: 'Daily notes not implemented for current schema' });
});

export default router;
