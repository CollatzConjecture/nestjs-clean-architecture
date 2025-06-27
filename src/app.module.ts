import { Module , NestModule, MiddlewareConsumer } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { LoggerMiddleware } from './application/middlewere/logger.middleware';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { TerminusOptionsService } from './infrastructure/health/terminus-options.check';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AuthModule } from './application/auth/auth.module';
import { ProfileModule } from './application/profile/profile.module';
import { ProfileController } from './application/controllers/profile.controller';
import { HelloController } from './application/controllers/hello.controller';
import { ThrottlerModule } from '@nestjs/throttler';

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
  ],
  controllers: [HelloController],
  providers: [
    TerminusOptionsService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(ProfileController);
  }
}
