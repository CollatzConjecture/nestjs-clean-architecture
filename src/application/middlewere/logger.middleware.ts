import { Injectable, NestMiddleware } from '@nestjs/common';
import { NODE_ENV } from '@constants';
import { LoggerService } from '@application/services/logger.service';

const REDACT_KEYS = [/pass/i, /token/i, /auth/i, /secret/i, /^email$/i, /code/i];
const SKIP_PATHS = new Set<string>(['/', '/health', '/metrics', '/favicon.ico']);
const SKIP_METHODS = new Set<string>(['OPTIONS', 'HEAD']);

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) { }

  use(req: any, res: any, next: any) {
    const method: string = req.method;
    const rawUrl: string = req.originalUrl || req.url || '';
    const urlPath: string = rawUrl.split('?')[0];

    if (SKIP_METHODS.has(method) || SKIP_PATHS.has(urlPath)) {
      return next();
    }

    const startTime = Date.now();
    const isProd = NODE_ENV === 'production';

    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      const { statusCode } = res;

      const forwardedFor = (req.headers?.['x-forwarded-for'] as string) || '';
      const clientIp = forwardedFor.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress;
      const userAgent = req.headers?.['user-agent'];

      const baseLog = {
        method,
        url: urlPath,
        statusCode,
        durationMs,
        requestId: req.requestId || req.headers?.['x-request-id'],
        clientIp,
        userAgent,
        userId: req.user?.id,
      } as const;

      // Determine severity
      const isServerError = statusCode >= 500;
      const isClientError = statusCode >= 400 && statusCode < 500;
      const isSlow = durationMs > 1000; // 1s threshold

      if (!isProd && ['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
        const redactedBody: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(req.body)) {
          if (REDACT_KEYS.some((regex) => regex.test(key))) {
            redactedBody[key] = '***';
          } else if (typeof value === 'string' && value.length > 256) {
            redactedBody[key] = value.slice(0, 256) + '…';
          } else {
            redactedBody[key] = value;
          }
        }
        const payload = { ...baseLog, body: redactedBody };
        if (isServerError) {
          this.loggerService.err(payload, { module: 'HTTP', method });
        } else if (isClientError || isSlow) {
          this.loggerService.warning(payload, { module: 'HTTP', method });
        } else {
          this.loggerService.logger(payload, { module: 'HTTP', method });
        }
      } else {
        if (isServerError) {
          this.loggerService.err(baseLog, { module: 'HTTP', method });
        } else if (isClientError || isSlow) {
          this.loggerService.warning(baseLog, { module: 'HTTP', method });
        } else {
          this.loggerService.logger(baseLog, { module: 'HTTP', method });
        }
      }
    });

    next();
  }
}
