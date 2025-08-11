import { APP_HOST } from '@constants';
import { Injectable, Logger } from '@nestjs/common';

export class Context {
  module: string;
  method: string;
}

@Injectable()
export class LoggerService extends Logger {
  logger(message: any, context?: Context) {
    const now = new Date();
    const standard = {
      server: APP_HOST,
      type: 'INFO',
      timestamp: now.toISOString(),
      epochMs: now.getTime(),
    };
    const data = { ...standard, ...context, message };
    super.log(data);
  }

  err(message: any, context: Context) {
    const now = new Date();
    const standard = {
      server: APP_HOST,
      type: 'ERROR',
      timestamp: now.toISOString(),
      epochMs: now.getTime(),
    };
    const data = { ...standard, ...context, message };
    super.error(data);
  }

  warning(message: any, context: Context) {
    const now = new Date();
    const standard = {
      server: APP_HOST,
      type: 'WARNING',
      timestamp: now.toISOString(),
      epochMs: now.getTime(),
    };
    const data = { ...standard, ...context, message };
    super.warn(data);
  }
} 