import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  SuccessResponseDto,
  ErrorResponseDto,
  PaginatedResponseDto,
  PaginationMeta,
  ApiResponse,
} from '@api/dto/common/api-response.dto';

@Injectable()
export class ResponseService {
  /**
   * Create a successful response
   */
  success<T>(message: string, data?: T): SuccessResponseDto<T> {
    return new SuccessResponseDto(message, data);
  }

  /**
   * Create an error response
   */
  error(message: string, code: string, details?: any): ErrorResponseDto {
    return new ErrorResponseDto(message, code, details);
  }

  /**
   * Create a paginated response
   */
  paginated<T>(
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return new PaginatedResponseDto(message, data, pagination);
  }

  /**
   * Create response with request context
   */
  withRequest<T>(response: ApiResponse<T>, req: Request): ApiResponse<T> {
    response.path = req.path;
    response.method = req.method;
    return response;
  }

  /**
   * Common success responses
   */
  created<T>(
    data?: T,
    message = 'Resource created successfully',
  ): SuccessResponseDto<T> {
    return this.success(message, data);
  }

  updated<T>(
    data?: T,
    message = 'Resource updated successfully',
  ): SuccessResponseDto<T> {
    return this.success(message, data);
  }

  deleted(message = 'Resource deleted successfully'): SuccessResponseDto {
    return this.success(message);
  }

  retrieved<T>(
    data: T,
    message = 'Resource retrieved successfully',
  ): SuccessResponseDto<T> {
    return this.success(message, data);
  }

  /**
   * Common error responses
   */
  notFound(
    message = 'Resource not found',
    code = 'NOT_FOUND',
  ): ErrorResponseDto {
    return this.error(message, code);
  }

  unauthorized(
    message = 'Unauthorized access',
    code = 'AUTHENTICATION_ERROR',
  ): ErrorResponseDto {
    return this.error(message, code);
  }

  forbidden(
    message = 'Access forbidden',
    code = 'AUTHORIZATION_ERROR',
  ): ErrorResponseDto {
    return this.error(message, code);
  }

  badRequest(
    message = 'Bad request',
    code = 'BAD_REQUEST',
    details?: any,
  ): ErrorResponseDto {
    return this.error(message, code, details);
  }

  validationError(
    details: any,
    message = 'Validation failed',
  ): ErrorResponseDto {
    return this.error(message, 'VALIDATION_ERROR', details);
  }

  internalError(
    message = 'Internal server error',
    code = 'INTERNAL_ERROR',
  ): ErrorResponseDto {
    return this.error(message, code);
  }
}
