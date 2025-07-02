import { Request } from 'express';
import { Role } from '@domain/entities/enums/role.enum';

export interface JwtPayload {
  id: string;         // User ID (transformed from 'sub' by JWT strategy)
  email: string;      // User email
  roles: Role[];      // User roles
  iat?: number;       // Issued at
  exp?: number;       // Expires at
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
} 