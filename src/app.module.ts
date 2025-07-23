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
import { ResponseService } from '@application/services/response.service';
import { ApiExceptionFilter } from '@application/filters/api-exception.filter';
import { ResponseInterceptor } from '@application/interceptors/response.interceptor';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

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
  controllers: [HelloController],
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
      .apply(LoggerMiddleware)
      .forRoutes(ProfileController, AuthController);
  }
}
