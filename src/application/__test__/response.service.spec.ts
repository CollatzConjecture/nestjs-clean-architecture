import { ResponseService } from '@application/services/response.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('ResponseService', () => {
  let service: ResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseService],
    }).compile();

    service = module.get<ResponseService>(ResponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create success response', () => {
    const result = service.success('Test message', { id: 1 });
    expect(result.message).toBe('Test message');
    expect(result.data).toEqual({ id: 1 });
    expect(result.timestamp).toBeDefined();
  });

  it('should create success response without data', () => {
    const result = service.success('Test message');
    expect(result.message).toBe('Test message');
    expect(result.data).toBeUndefined();
    expect(result.timestamp).toBeDefined();
  });

  it('should create error response', () => {
    const result = service.error('Error message', 'ERROR_CODE', { detail: 'test' });
    expect(result.message).toBe('Error message');
    expect(result.error.code).toBe('ERROR_CODE');
    expect(result.error.details).toEqual({ detail: 'test' });
    expect(result.timestamp).toBeDefined();
  });

  it('should create created response', () => {
    const result = service.created({ id: 1 }, 'Created successfully');
    expect(result.message).toBe('Created successfully');
    expect(result.data).toEqual({ id: 1 });
    expect(result.timestamp).toBeDefined();
  });

  it('should create created response with default message', () => {
    const result = service.created({ id: 1 });
    expect(result.message).toBe('Resource created successfully');
    expect(result.data).toEqual({ id: 1 });
    expect(result.timestamp).toBeDefined();
  });

  it('should create updated response', () => {
    const result = service.updated({ id: 1 }, 'Updated successfully');
    expect(result.message).toBe('Updated successfully');
    expect(result.data).toEqual({ id: 1 });
    expect(result.timestamp).toBeDefined();
  });

  it('should create updated response with default message', () => {
    const result = service.updated({ id: 1 });
    expect(result.message).toBe('Resource updated successfully');
    expect(result.data).toEqual({ id: 1 });
    expect(result.timestamp).toBeDefined();
  });

  it('should create deleted response', () => {
    const result = service.deleted('Deleted successfully');
    expect(result.message).toBe('Deleted successfully');
    expect(result.timestamp).toBeDefined();
  });

  it('should create deleted response with default message', () => {
    const result = service.deleted();
    expect(result.message).toBe('Resource deleted successfully');
    expect(result.timestamp).toBeDefined();
  });

  it('should create retrieved response', () => {
    const result = service.retrieved({ id: 1 }, 'Retrieved successfully');
    expect(result.message).toBe('Retrieved successfully');
    expect(result.data).toEqual({ id: 1 });
    expect(result.timestamp).toBeDefined();
  });

  it('should create retrieved response with default message', () => {
    const result = service.retrieved({ id: 1 });
    expect(result.message).toBe('Resource retrieved successfully');
    expect(result.data).toEqual({ id: 1 });
    expect(result.timestamp).toBeDefined();
  });

  it('should create paginated response', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = service.paginated('Paginated data', data, 1, 10, 20);
    
    expect(result.message).toBe('Paginated data');
    expect(result.data).toEqual(data);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 20,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    });
    expect(result.timestamp).toBeDefined();
  });

  it('should create not found error', () => {
    const result = service.notFound('Custom not found', 'CUSTOM_NOT_FOUND');
    expect(result.message).toBe('Custom not found');
    expect(result.error.code).toBe('CUSTOM_NOT_FOUND');
    expect(result.timestamp).toBeDefined();
  });

  it('should create not found error with defaults', () => {
    const result = service.notFound();
    expect(result.message).toBe('Resource not found');
    expect(result.error.code).toBe('NOT_FOUND');
    expect(result.timestamp).toBeDefined();
  });

  it('should create unauthorized error', () => {
    const result = service.unauthorized('Custom unauthorized', 'CUSTOM_AUTH');
    expect(result.message).toBe('Custom unauthorized');
    expect(result.error.code).toBe('CUSTOM_AUTH');
    expect(result.timestamp).toBeDefined();
  });

  it('should create unauthorized error with defaults', () => {
    const result = service.unauthorized();
    expect(result.message).toBe('Unauthorized access');
    expect(result.error.code).toBe('AUTHENTICATION_ERROR');
    expect(result.timestamp).toBeDefined();
  });

  it('should create forbidden error', () => {
    const result = service.forbidden('Custom forbidden', 'CUSTOM_FORBIDDEN');
    expect(result.message).toBe('Custom forbidden');
    expect(result.error.code).toBe('CUSTOM_FORBIDDEN');
    expect(result.timestamp).toBeDefined();
  });

  it('should create forbidden error with defaults', () => {
    const result = service.forbidden();
    expect(result.message).toBe('Access forbidden');
    expect(result.error.code).toBe('AUTHORIZATION_ERROR');
    expect(result.timestamp).toBeDefined();
  });

  it('should create bad request error', () => {
    const result = service.badRequest('Custom bad request', 'CUSTOM_BAD_REQUEST', { field: 'invalid' });
    expect(result.message).toBe('Custom bad request');
    expect(result.error.code).toBe('CUSTOM_BAD_REQUEST');
    expect(result.error.details).toEqual({ field: 'invalid' });
    expect(result.timestamp).toBeDefined();
  });

  it('should create bad request error with defaults', () => {
    const result = service.badRequest();
    expect(result.message).toBe('Bad request');
    expect(result.error.code).toBe('BAD_REQUEST');
    expect(result.timestamp).toBeDefined();
  });

  it('should create validation error', () => {
    const details = { field: 'required' };
    const result = service.validationError(details, 'Custom validation error');
    expect(result.message).toBe('Custom validation error');
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(result.error.details).toEqual(details);
    expect(result.timestamp).toBeDefined();
  });

  it('should create validation error with default message', () => {
    const details = { field: 'required' };
    const result = service.validationError(details);
    expect(result.message).toBe('Validation failed');
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(result.error.details).toEqual(details);
    expect(result.timestamp).toBeDefined();
  });

  it('should create internal error', () => {
    const result = service.internalError('Custom internal error', 'CUSTOM_INTERNAL');
    expect(result.message).toBe('Custom internal error');
    expect(result.error.code).toBe('CUSTOM_INTERNAL');
    expect(result.timestamp).toBeDefined();
  });

  it('should create internal error with defaults', () => {
    const result = service.internalError();
    expect(result.message).toBe('Internal server error');
    expect(result.error.code).toBe('INTERNAL_ERROR');
    expect(result.timestamp).toBeDefined();
  });

  it('should add request context to response', () => {
    const response = service.success('Test message', { id: 1 });
    const mockRequest = {
      path: '/test',
      method: 'GET',
    } as any;

    const result = service.withRequest(response, mockRequest);
    expect(result.path).toBe('/test');
    expect(result.method).toBe('GET');
  });
});