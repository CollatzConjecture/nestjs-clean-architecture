import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: any) {
    console.log(`🌐 ${req.method} ${req.url}`);
    
    if (['GET', 'POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '***';
      console.log('📦 Body:', sanitizedBody);
    }
    
    if (req.user) {
      console.log('👤 User:', { id: req.user.id, email: req.user.email, roles: req.user.roles });
    }
    
    next();
  }
}
