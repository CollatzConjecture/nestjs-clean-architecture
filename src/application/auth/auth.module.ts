import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '@domain/services/auth.service';
import { AuthController } from '@application/controllers/auth.controller';
import { JwtStrategy } from '@application/auth/jwt.strategy';
import { modelProviders } from '@infrastructure/models';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ProfileService } from '@domain/services/profile.service';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { JWT_SECRET, JWT_EXPIRATION_TIME } from '@constants';
import { LocalStrategy } from '@application/auth/local.strategy';
import { AuthRepository } from '@infrastructure/repository/auth.repository';
import { CreateAuthUserHandler } from '@application/auth/command/handler/create-auth-user.handler';
import { DeleteAuthUserHandler } from '@application/auth/command/handler/delete-auth-user.handler';
import { GoogleStrategy } from '@application/auth/google.strategy';

export const CommandHandlers = [CreateAuthUserHandler, DeleteAuthUserHandler];

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRATION_TIME },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    ProfileService,
    ProfileRepository,
    AuthRepository,
    ...modelProviders,
    ...CommandHandlers,
  ],
  exports: [AuthService],
})

export class AuthModule {} 