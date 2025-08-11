import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: any) {
    const incomingId =
      req.headers['x-request-id'] ||
      req.headers['x-correlation-id'] ||
      req.headers['x-amzn-trace-id'];

    const requestId = typeof incomingId === 'string' && incomingId.length > 0 ? incomingId : randomUUID();

    req.requestId = requestId;

    res.setHeader('x-request-id', requestId);

    next();
  }
}
