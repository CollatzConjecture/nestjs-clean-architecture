import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ResponseService } from '@application/services/response.service';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly responseService: ResponseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        // If data is already a formatted response (has message field), return as-is
        if (data && typeof data === 'object' && 'message' in data) {
          return this.responseService.withRequest(data, request);
        }

        // If data is null/undefined, return success response without data
        if (data === null || data === undefined) {
          return this.responseService.withRequest(
            this.responseService.success('Operation completed successfully'),
            request,
          );
        }

        // If data is a string, treat as message
        if (typeof data === 'string') {
          return this.responseService.withRequest(
            this.responseService.success(data),
            request,
          );
        }

        // If data is an object with access_token (login response), format specially
        if (data && typeof data === 'object' && 'access_token' in data) {
          return this.responseService.withRequest(
            this.responseService.success('Authentication successful', data),
            request,
          );
        }

        // Default: wrap data in success response
        return this.responseService.withRequest(
          this.responseService.success(
            'Operation completed successfully',
            data,
          ),
          request,
        );
      }),
    );
  }
}
