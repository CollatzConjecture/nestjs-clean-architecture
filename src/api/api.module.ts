import { Module } from '@nestjs/common';
import { AuthController } from '@api/controllers/auth.controller';
import { ProfileController } from '@api/controllers/profile.controller';
import { HelloController } from '@api/controllers/hello.controller';
import { ApplicationModule } from '@application/application.module';
import { ResponseService } from '@application/services/response.service';
import { ResponseInterceptor } from '@application/interceptors/response.interceptor';

@Module({
  imports: [ApplicationModule],
  controllers: [AuthController, ProfileController, HelloController],
  providers: [ResponseService, ResponseInterceptor],
})
export class ApiModule {}
