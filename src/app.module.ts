import { LoggerModule } from '@infrastructure/logger/logger.module';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ApiModule } from '@api/api.module';
import { AuthController } from '@api/controllers/auth.controller';
import { HelloController } from '@api/controllers/hello.controller';
import { ProfileController } from '@api/controllers/profile.controller';
import { LoggerMiddleware } from '@application/middlewere/logger.middleware';
import { TerminusOptionsService } from '@infrastructure/health/terminus-options.check';
import { ApplicationModule } from '@application/application.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ApiModule,
    ApplicationModule,
    TerminusModule,
    HttpModule,
    PrometheusModule.register(),
    LoggerModule,
  ],
  controllers: [HelloController],
  providers: [TerminusOptionsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(ProfileController, AuthController);
  }
}
