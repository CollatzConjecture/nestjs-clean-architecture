import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { Profile } from '@domain/entities/Profile';
import { FindProfilesQuery } from '@application/profile/query/find-profiles.query';
import { Logger } from '@nestjs/common';

@QueryHandler(FindProfilesQuery)
export class FindProfilesHandler implements IQueryHandler<FindProfilesQuery> {
  private readonly logger = new Logger(FindProfilesHandler.name);

  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(query: FindProfilesQuery): Promise<Profile[]> {
    this.logger.log('Executing FindProfilesQuery');
    return this.profileRepository.find();
  }
}
