import { LoggerModule } from '@infrastructure/logger/logger.module';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AuthModule } from './application/auth/auth.module';
import { AuthController } from './application/controllers/auth.controller';
import { HelloController } from './application/controllers/hello.controller';
import { ProfileController } from './application/controllers/profile.controller';
import { LoggerMiddleware } from './application/middlewere/logger.middleware';
import { ProfileModule } from './application/profile/profile.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { TerminusOptionsService } from './infrastructure/health/terminus-options.check';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    ProfileModule,
    DatabaseModule,
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
