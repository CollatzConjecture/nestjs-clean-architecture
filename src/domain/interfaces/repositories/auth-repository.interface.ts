import { AuthUser } from '@domain/entities/Auth';

export interface IAuthRepository {
  create(user: Partial<AuthUser>): Promise<AuthUser>;
  findById(id: string): Promise<AuthUser | null>;
  findByEmail(email: string, includePassword?: boolean): Promise<AuthUser | null>;
  findByGoogleId(googleId: string): Promise<AuthUser | null>;
  update(id: string, user: Partial<AuthUser>): Promise<AuthUser>;
  delete(id: string): Promise<void>;
  removeRefreshToken(userId: string): Promise<void>;
} 