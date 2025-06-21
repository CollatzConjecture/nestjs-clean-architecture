import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { modelProviders } from '@infrastructure/models';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { CreateProfileHandler } from '@application/profile/command/handler/create-profile.handler';
import { ProfileService } from '@domain/services/profile.service';
import { ProfileController } from '@application/controllers/profile.controller';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RegistrationSaga } from '@application/auth/sagas/registration.saga';
import { FindProfilesHandler } from '@application/profile/query/handler/find-profiles.handler';
import { FindProfileByIdHandler } from '@application/profile/query/handler/find-profile-by-id.handler';

export const CommandHandlers = [CreateProfileHandler];
export const QueryHandlers = [FindProfilesHandler, FindProfileByIdHandler];
export const Sagas = [RegistrationSaga];

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfileRepository,
    ...modelProviders,
    ...CommandHandlers,
    ...QueryHandlers,
    ...Sagas,
  ],
})
export class ProfileModule {} 