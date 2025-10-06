import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const currentUrl = req.url ?? '/';
  const normalized = currentUrl.startsWith('/') ? currentUrl : `/${currentUrl}`;

  if (!normalized.startsWith('/api')) {
    req.url = `/api${normalized}`;
  } else {
    req.url = normalized;
  }

  (req as any).originalUrl = req.url;

  return app(req as any, res as any);
}
