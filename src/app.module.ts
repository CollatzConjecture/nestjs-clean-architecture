import { ApiModule } from '@api/api.module';
import { AuthController } from '@api/controllers/auth.controller';
import { HelloController } from '@api/controllers/hello.controller';
import { ProfileController } from '@api/controllers/profile.controller';
import { ApplicationModule } from '@application/application.module';
import { ApiExceptionFilter } from '@application/filters/api-exception.filter';
import { ResponseInterceptor } from '@application/interceptors/response.interceptor';
import { LoggerMiddleware } from '@application/middlewere/logger.middleware';
import { RequestIdMiddleware } from '@application/middlewere/request-id.middleware';
import { ResponseService } from '@application/services/response.service';
import { HealthController } from '@infrastructure/health/health.controller';
import { TerminusOptionsService } from '@infrastructure/health/terminus-options.check';
import { LoggerModule } from '@infrastructure/logger/logger.module';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ApiModule,
    ApplicationModule,
    TerminusModule,
    HttpModule,
    PrometheusModule.register(),
    LoggerModule,
  ],
  controllers: [HelloController, HealthController],
  providers: [
    TerminusOptionsService,
    ResponseService,
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, RequestIdMiddleware)
      .forRoutes(ProfileController, AuthController);
  }
}
