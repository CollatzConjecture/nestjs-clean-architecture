import { RolesGuard } from '@application/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '@domain/entities/enums/role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    const mockContext = createMockExecutionContext({});
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const mockContext = createMockExecutionContext({
      user: { roles: [Role.ADMIN] }
    });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    const mockContext = createMockExecutionContext({
      user: { roles: [Role.USER] }
    });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it('should allow access when user has one of multiple required roles', () => {
    const mockContext = createMockExecutionContext({
      user: { roles: [Role.USER, Role.ADMIN] }
    });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN, Role.USER]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should deny access when user has no roles', () => {
    const mockContext = createMockExecutionContext({
      user: { roles: [] }
    });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it('should deny access when user roles is undefined', () => {
    const mockContext = createMockExecutionContext({
      user: {}
    });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
  });

  function createMockExecutionContext(request: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({} as any),
        getNext: () => jest.fn() as any,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      getArgs: () => [] as any,
      getArgByIndex: () => ({} as any),
      switchToRpc: () => ({
        getContext: () => ({} as any),
        getData: () => ({} as any),
      }),
      switchToWs: () => ({
        getClient: () => ({} as any),
        getData: () => ({} as any),
        getPattern: () => 'test-pattern',
      }),
      getType: () => 'http' as any,
    };
  }
});