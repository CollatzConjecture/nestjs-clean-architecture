import { Profile } from '@domain/entities/Profile';
import { Role } from '@domain/entities/enums/role.enum';

export interface IProfileRepository {
  create(profile: Partial<Profile>): Promise<Profile>;
  findById(id: string): Promise<Profile | null>;
  findByAuthId(authId: string): Promise<Profile | null>;
  findAll(): Promise<Profile[]>;
  findByRole(role: Role): Promise<Profile[]>;
  update(id: string, profile: Partial<Profile>): Promise<Profile>;
  delete(id: string): Promise<void>;
} 