import { Inject, Injectable } from '@nestjs/common';

import { CreateProfileDto } from '@api/dto/create-profile.dto';
import { Profile } from '@domain/entities/Profile';
import { Role } from '@domain/entities/enums/role.enum';
import { IProfileRepository } from '@domain/interfaces/repositories/profile-repository.interface';
import { LoggerService } from '@application/services/logger.service';
import { ProfileDomainService } from '@domain/services/profile-domain.service';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('IProfileRepository')
    private readonly repository: IProfileRepository,
    private readonly logger: LoggerService,
    private readonly profileDomainService: ProfileDomainService,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    this.logger.logger(`Creating profile.`, {
      module: 'ProfileService',
      method: 'create',
    });

    const existingProfile = await this.repository.findByAuthId(
      createProfileDto.authId,
    );
    if (!this.profileDomainService.canCreateProfile(existingProfile)) {
      throw new Error('Profile already exists for this user');
    }

    const profileEntity = this.profileDomainService.createProfileEntity({
      authId: createProfileDto.authId,
      name: createProfileDto.name,
      lastname: createProfileDto.lastname,
      age: createProfileDto.age,
    });

    return await this.repository.create(profileEntity);
  }

  async find(): Promise<Profile[]> {
    const context = { module: 'ProfileService', method: 'find' };
    this.logger.logger('Fetching all profiles', context);
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Profile | null> {
    const context = { module: 'ProfileService', method: 'findById' };
    this.logger.logger(`Fetching profile for id: ${id}`, context);
    return this.repository.findById(id);
  }

  async findByRole(role: Role): Promise<Profile[]> {
    const context = { module: 'ProfileService', method: 'findByRole' };
    this.logger.logger(`Fetching profiles with role: ${role}`, context);
    return this.repository.findByRole(role);
  }

  async updateMyProfile(
    updates: Partial<Profile>,
    requestingUserId: string,
  ): Promise<Profile> {
    this.logger.logger(`User ${requestingUserId} updating their own profile`, {
      module: 'ProfileService',
      method: 'updateMyProfile',
    });

    const profile = await this.repository.findByAuthId(requestingUserId);
    if (!profile) {
      throw new Error('Profile not found for current user');
    }

    const validatedUpdates = this.profileDomainService.validateProfileUpdate(
      profile,
      updates,
    );

    return await this.repository.update(profile.id, validatedUpdates);
  }

  async isProfileComplete(profileId: string): Promise<boolean> {
    const profile = await this.repository.findById(profileId);
    if (!profile) {
      return false;
    }

    return this.profileDomainService.isProfileComplete(profile);
  }
}
