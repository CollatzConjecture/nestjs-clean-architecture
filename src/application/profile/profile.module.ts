import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { modelProviders } from '@infrastructure/models';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { CreateProfileHandler } from './command/handler/create-profile.handler';
import { ProfileService } from '@domain/services/profile.service';
import { ProfileController } from '../controllers/profile.controller';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RegistrationSaga } from '../auth/sagas/registration.saga';

export const CommandHandlers = [CreateProfileHandler];
export const Sagas = [RegistrationSaga];

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfileRepository,
    ...modelProviders,
    ...CommandHandlers,
    ...Sagas,
  ],
})
export class ProfileModule {} 