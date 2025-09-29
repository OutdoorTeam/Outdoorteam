import { Router } from 'express';
const router = Router();

router.use((_req, res) => {
  res.status(501).json({ message: 'Daily notes not implemented for current schema' });
});

export default router;
