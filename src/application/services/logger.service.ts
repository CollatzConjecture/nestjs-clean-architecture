import { APP_HOST } from '@constants';
import { Injectable, Logger } from '@nestjs/common';

export class Context {
  module: string;
  method: string;
}

@Injectable()
export class LoggerService extends Logger {
  logger(message: any, context?: Context) {
    const standard = {server: APP_HOST, type: 'INFO', time: Date.now()};
    const data = {...standard, ...context, message};
    super.log(data);
  }

  err(message: any, context: Context) {
    const standard = {server: APP_HOST, type: 'ERROR', time: Date.now()};
    const data = {...standard, ...context, message};
    super.error(data);
  }

  warning(message: any, context: Context) {
    const standard = {server: APP_HOST, type: 'WARNING', time: Date.now()};
    const data = {...standard, ...context, message};
    super.warn(data);
  }
} 