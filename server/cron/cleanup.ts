import 'dotenv/config';
import { SystemLogger } from '../utils/logging.js';

// Script simple de limpieza de logs viejos en database_alerts
(async () => {
  try {
    const arg = process.argv[2];
    const days = Number.isFinite(Number(arg)) ? Number(arg) : 30;

    const deleted = await SystemLogger.purgeOldLogs(days);
    console.log(`🧹 Cleanup done (older than ${days} days). Deleted ${deleted} rows.`);
    process.exit(0);
  } catch (err) {
    console.error('Cleanup error:', err);
    process.exit(1);
  }
})();
