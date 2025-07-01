import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { Profile } from '@domain/entities/Profile';
import { FindProfileByIdQuery } from '@application/profile/query/find-profile-by-id.query';
import { NotFoundException } from '@nestjs/common';
import { LoggerService } from '@domain/services/logger.service';

@QueryHandler(FindProfileByIdQuery)
export class FindProfileByIdHandler implements IQueryHandler<FindProfileByIdQuery> {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(query: FindProfileByIdQuery): Promise<Profile | null> {
    const context = { module: 'FindProfileByIdHandler', method: 'execute' };
    
    this.logger.logger(`Looking up profile with ID: ${query.id}`, context);

    const profile = await this.profileRepository.findById(query.id);

    if (!profile) {
      this.logger.warning(`Profile not found for ID: ${query.id}`, context);
      throw new NotFoundException('Profile not found');
    }

    this.logger.logger(`Profile found for ID: ${query.id}`, context);
    return profile;
  }
} 