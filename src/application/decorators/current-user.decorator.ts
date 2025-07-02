import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@application/interfaces/authenticated-request.interface';
import { Role } from '@domain/entities/enums/role.enum';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.id;
  },
);

export const IsAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): boolean => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.roles?.includes(Role.ADMIN) || false;
  },
); 