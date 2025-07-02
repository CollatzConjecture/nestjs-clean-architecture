import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '@application/services/auth.service';
import { AuthController } from '@application/controllers/auth.controller';
import { JwtStrategy } from '@application/auth/jwt.strategy';
import { modelProviders } from '@infrastructure/models';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ProfileService } from '@application/services/profile.service';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { JWT_SECRET, JWT_EXPIRATION_TIME } from '@constants';
import { LocalStrategy } from '@application/auth/local.strategy';
import { AuthRepository } from '@infrastructure/repository/auth.repository';
import { CreateAuthUserHandler } from '@application/auth/command/handler/create-auth-user.handler';
import { DeleteAuthUserHandler } from '@application/auth/command/handler/delete-auth-user.handler';
import { GoogleStrategy } from '@application/auth/google.strategy';
import { AuthDomainService } from '@domain/services/auth-domain.service';
import { ProfileDomainService } from '@domain/services/profile-domain.service';

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
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    AuthService,
    ProfileService,
    AuthDomainService,
    ProfileDomainService,
    {
      provide: 'IAuthRepository',
      useClass: AuthRepository,
    },
    {
      provide: 'IProfileRepository',
      useClass: ProfileRepository,
    },
    ...modelProviders,
    ...CommandHandlers,
  ],
  exports: [AuthService],
})

export class AuthModule {} 