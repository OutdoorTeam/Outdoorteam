import { Router } from 'express';
const router = Router();

router.all('*', (_req, res) => {
  res.status(501).json({ message: 'Avatar API not implemented for current schema' });
});

export default router;
