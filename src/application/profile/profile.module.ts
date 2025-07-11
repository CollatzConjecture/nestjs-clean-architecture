import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { modelProviders } from '@infrastructure/models';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { CreateProfileHandler } from '@application/profile/command/handler/create-profile.handler';
import { ProfileService } from '@application/services/profile.service';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RegistrationSaga } from '@application/auth/sagas/registration.saga';
import { ProfileDomainService } from '@domain/services/profile-domain.service';

export const CommandHandlers = [CreateProfileHandler];
export const Sagas = [RegistrationSaga];

@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [
    ProfileService,
    ProfileDomainService,
    {
      provide: 'IProfileRepository',
      useClass: ProfileRepository,
    },
    ...modelProviders,
    ...CommandHandlers,
    ...Sagas,
  ],
  exports: [ProfileService, ProfileDomainService, 'IProfileRepository'],
})

export class ProfileModule { } 