import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseService } from '@application/services/response.service';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly responseService: ResponseService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Handle validation errors specifically
      if (exception instanceof BadRequestException) {
        if (Array.isArray(exceptionResponse.message)) {
          // Multiple validation errors
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
          details = exceptionResponse.message;
        } else if (typeof exceptionResponse.message === 'string') {
          // Single validation error
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
          details = [exceptionResponse.message];
        } else {
          // Other bad request errors
          message = exceptionResponse.message || 'Bad request';
          code = 'BAD_REQUEST';
        }
      } else {
        // Handle other HTTP exceptions
        if (typeof exceptionResponse === 'string') {
          message = exceptionResponse;
        } else if (exceptionResponse.message) {
          message = Array.isArray(exceptionResponse.message)
            ? exceptionResponse.message[0]
            : exceptionResponse.message;
        }

        // Map HTTP status to error codes
        switch (status) {
          case HttpStatus.UNAUTHORIZED:
            code = 'AUTHENTICATION_ERROR';
            break;
          case HttpStatus.FORBIDDEN:
            code = 'AUTHORIZATION_ERROR';
            break;
          case HttpStatus.NOT_FOUND:
            code = 'NOT_FOUND';
            break;
          case HttpStatus.CONFLICT:
            code = 'CONFLICT';
            break;
          case HttpStatus.UNPROCESSABLE_ENTITY:
            code = 'VALIDATION_ERROR';
            details = exceptionResponse.message;
            break;
          case HttpStatus.TOO_MANY_REQUESTS:
            code = 'RATE_LIMIT_EXCEEDED';
            break;
          default:
            code = 'HTTP_ERROR';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = 'APPLICATION_ERROR';
    }

    const errorResponse = this.responseService.error(message, code, details);
    const responseWithContext = this.responseService.withRequest(
      errorResponse,
      request,
    );

    response.status(status).json(responseWithContext);
  }
}
