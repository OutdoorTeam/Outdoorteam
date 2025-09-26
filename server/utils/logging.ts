import { db } from '../database.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export class SystemLogger {
  /** Log genérico a la tabla database_alerts */
  static async log(
    level: LogLevel,
    message: string,
    opts?: {
      req?: any;
      userId?: string | null;
      metadata?: Record<string, unknown>;
      error?: Error;
    }
  ): Promise<void> {
    try {
      const details: any = {
        userId: opts?.userId ?? null,
        metadata: opts?.metadata ?? undefined,
      };

      if (opts?.error) {
        details.error = {
          name: opts.error.name,
          message: opts.error.message,
          stack: opts.error.stack,
        };
      }

      if (opts?.req) {
        details.request = {
          method: opts.req.method,
          url: opts.req.originalUrl || opts.req.url,
          ip: (opts.req.headers?.['x-forwarded-for'] as string) || opts.req.ip || null,
        };
      }

      await db!
        .insertInto('database_alerts')
        .values({
          severity: level,
          message,
          details,
          resolved: false,
          created_at: new Date(),
        } as any)
        .executeTakeFirst();
    } catch (e) {
      console.error('SystemLogger.log failed:', e);
    }
  }

  /** Helper para errores críticos */
  static async logCriticalError(
    message: string,
    error: Error,
    ctx?: { userId?: string | null; req?: any; metadata?: Record<string, unknown> }
  ): Promise<void> {
    await this.log('critical', message, {
      error,
      userId: ctx?.userId ?? null,
      req: ctx?.req,
      metadata: ctx?.metadata,
    });
  }

  /** Helper para errores de autenticación */
  static async logAuthError(
    message: string,
    email?: string,
    req?: any
  ): Promise<void> {
    const metadata = email ? { email } : undefined;
    await this.log('warn', message, {
      req,
      metadata,
    });
  }

  /** Trae últimos logs para dashboards */
  static async getRecent(level?: LogLevel, limit = 100) {
    let q = db!
      .selectFrom('database_alerts')
      .select(['id', 'severity as level', 'message', 'details', 'resolved', 'created_at'])
      .orderBy('created_at', 'desc')
      .limit(limit);

    if (level) q = q.where('severity', '=', level);
    return q.execute();
  }

  /** Borra logs más viejos que N días (para tu script de limpieza) */
  static async purgeOldLogs(olderThanDays = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - olderThanDays);

    const { numDeletedRows } = await db!
      .deleteFrom('database_alerts')
      .where('created_at', '<', cutoff)
      .executeTakeFirst();

    const deleted =
      typeof numDeletedRows === 'bigint'
        ? Number(numDeletedRows)
        : Number(numDeletedRows ?? 0);

    return deleted;
  }
}


