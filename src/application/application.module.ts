import { AuthModule } from '@application/auth/auth.module';
import { ProfileModule } from '@application/profile/profile.module';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { modelProviders } from '@infrastructure/models';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule, ProfileModule, DatabaseModule],
  providers: [
    ...modelProviders,
  ],
  exports: [AuthModule, ProfileModule],
})
export class ApplicationModule {} 