import { Module } from '@nestjs/common';
import { AuthController } from '@api/controllers/auth.controller';
import { ProfileController } from '@api/controllers/profile.controller';
import { HelloController } from '@api/controllers/hello.controller';
import { ApplicationModule } from '@application/application.module';
 
@Module({
  imports: [ApplicationModule],
  controllers: [AuthController, ProfileController, HelloController],
})
export class ApiModule {} 