import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { CreateProfileDto } from '@application/dto/create-profile.dto';
import { FindProfileByIdQuery } from '@application/profile/query/find-profile-by-id.query';
import { FindProfilesQuery } from '@application/profile/query/find-profiles.query';
import { Profile } from '@domain/entities/Profile';
import { Role } from '@domain/entities/enums/role.enum';
import { IProfileRepository } from '@domain/interfaces/repositories/profile-repository.interface';
import { LoggerService } from '@domain/services/logger.service';
import { ProfileDomainService } from '@domain/services/profile-domain.service';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('IProfileRepository')
    private readonly repository: IProfileRepository,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
    private readonly profileDomainService: ProfileDomainService,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    this.logger.logger(`Creating profile.`, { module: 'ProfileService', method: 'create' });
    
    return await this.profileDomainService.createProfile({
      authId: createProfileDto.authId,
      name: createProfileDto.name,
      lastname: createProfileDto.lastname,
      age: createProfileDto.age,
    });
  }

  async find(): Promise<Profile[]> {
    const context = { module: 'ProfileService', method: 'find' };
    this.logger.logger('Fetching all profiles', context);
    return this.queryBus.execute(new FindProfilesQuery());
  }

  async findById(id: string): Promise<Profile | null> {
    const context = { module: 'ProfileService', method: 'findById' };
    this.logger.logger(`Fetching profile for id: ${id}`, context);
    return this.queryBus.execute(new FindProfileByIdQuery(id));
  }

  async findByRole(role: Role): Promise<Profile[]> {
    const context = { module: 'ProfileService', method: 'findByRole' };
    this.logger.logger(`Fetching profiles with role: ${role}`, context);
    return this.repository.findByRole(role);
  }

  async updateMyProfile(updates: Partial<Profile>, requestingUserId: string): Promise<Profile> {
    this.logger.logger(`User ${requestingUserId} updating their own profile`, { module: 'ProfileService', method: 'updateMyProfile' });
    
    const profile = await this.repository.findByAuthId(requestingUserId);
    if (!profile) {
      throw new Error('Profile not found for current user');
    }

    this.profileDomainService.validateProfileUpdate(updates);
    
    return await this.repository.update(profile.id, updates);
  }

  async delete(profileId: string, requestingUserId: string, isAdmin: boolean = false): Promise<void> {
    this.logger.logger(`Deleting profile ${profileId}`, { module: 'ProfileService', method: 'delete' });
    
    const profile = await this.repository.findById(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const canDelete = this.profileDomainService.canDeleteProfile(profile, requestingUserId, isAdmin);
    if (!canDelete) {
      throw new Error('Not authorized to delete this profile');
    }

    await this.repository.delete(profileId);
  }

  async isProfileComplete(profileId: string): Promise<boolean> {
    const profile = await this.repository.findById(profileId);
    if (!profile) {
      return false;
    }

    return this.profileDomainService.isProfileComplete(profile);
  }
} 