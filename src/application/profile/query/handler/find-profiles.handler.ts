import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { Profile } from '@domain/entities/Profile';
import { FindProfilesQuery } from '@application/profile/query/find-profiles.query';
import { LoggerService } from '@domain/services/logger.service';

@QueryHandler(FindProfilesQuery)
export class FindProfilesHandler implements IQueryHandler<FindProfilesQuery> {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(query: FindProfilesQuery): Promise<Profile[]> {
    const context = { module: 'FindProfilesHandler', method: 'execute' };
    
    this.logger.logger('Fetching all profiles from database', context);
    const profiles = await this.profileRepository.find();
    
    this.logger.logger(`Retrieved ${profiles.length} profiles`, context);
    return profiles;
  }
}
