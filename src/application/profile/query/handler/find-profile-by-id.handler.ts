import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { Profile } from '@domain/entities/Profile';
import { FindProfileByIdQuery } from '@application/profile/query/find-profile-by-id.query';
import { Logger, NotFoundException } from '@nestjs/common';

@QueryHandler(FindProfileByIdQuery)
export class FindProfileByIdHandler implements IQueryHandler<FindProfileByIdQuery> {
  private readonly logger = new Logger(FindProfileByIdHandler.name);

  constructor(private readonly profileRepository: ProfileRepository) { }

  async execute(query: FindProfileByIdQuery): Promise<Profile | null> {
    this.logger.log(`Executing FindProfileByIdQuery for id: ${query.id}`);

    const profile = await this.profileRepository.findById(query.id);

    if (!profile) {
      this.logger.warn(`Profile not found for id: ${query.id}`);
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
} 