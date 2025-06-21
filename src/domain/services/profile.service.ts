import { Injectable } from '@nestjs/common';
import { Profile } from '@domain/entities/Profile';
import { CreateProfileDto } from '@application/dto/create-profile.dto';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { QueryBus } from '@nestjs/cqrs';
import { FindProfilesQuery } from '@application/profile/query/find-profiles.query';
import { FindProfileByIdQuery } from '@application/profile/query/find-profile-by-id.query';
import { LoggerService, Context } from '@domain/services/logger.service';

@Injectable()
export class ProfileService {
  private Log: LoggerService = new LoggerService('ProfileService');

  constructor(
    private readonly repository: ProfileRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    return await this.repository.create(createProfileDto);
  }

  async find(): Promise<Profile[]> {
    const context: Context = { module: 'ProfileService', method: 'find' };
    this.Log.logger('Fetching all profiles', context);
    return this.queryBus.execute(new FindProfilesQuery());
  }

  async findById(id: string): Promise<Profile | null> {
    const context: Context = { module: 'ProfileService', method: 'findById' };
    this.Log.logger(`Fetching profile for id: ${id}`, context);
    return this.queryBus.execute(new FindProfileByIdQuery(id));
  }
}
