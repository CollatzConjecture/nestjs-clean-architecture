import { ApiProperty } from '@nestjs/swagger';

// Base response interface
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  timestamp?: string;
  path?: string;
  method?: string;
}

// Success response DTO
export class SuccessResponseDto<T = any> implements ApiResponse<T> {
  @ApiProperty({
    description: 'Human-readable message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data?: T;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp?: string;

  @ApiProperty({ description: 'Request path', example: '/api/v1/profile/123' })
  path?: string;

  @ApiProperty({ description: 'HTTP method', example: 'GET' })
  method?: string;

  constructor(message: string, data?: T, meta?: any) {
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    if (meta) {
      this.path = meta.path;
      this.method = meta.method;
    }
  }
}

// Error response DTO
export class ErrorResponseDto implements ApiResponse {
  @ApiProperty({
    description: 'Human-readable error message',
    example: 'User not found',
  })
  message: string;

  @ApiProperty({ description: 'Error details' })
  error: {
    code: string;
    details?: any;
  };

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp?: string;

  @ApiProperty({ description: 'Request path', example: '/api/v1/profile/123' })
  path?: string;

  @ApiProperty({ description: 'HTTP method', example: 'GET' })
  method?: string;

  constructor(message: string, code: string, details?: any, meta?: any) {
    this.message = message;
    this.error = { code, details };
    this.timestamp = new Date().toISOString();
    if (meta) {
      this.path = meta.path;
      this.method = meta.method;
    }
  }
}

// Pagination metadata
export class PaginationMeta {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;
}

// Paginated response
export class PaginatedResponseDto<T = any> extends SuccessResponseDto<T[]> {
  @ApiProperty({ description: 'Pagination metadata' })
  pagination: PaginationMeta;

  constructor(
    message: string,
    data: T[],
    pagination: PaginationMeta,
    meta?: any,
  ) {
    super(message, data, meta);
    this.pagination = pagination;
  }
}
