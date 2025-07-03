import { CreateAuthUserHandler } from '@application/auth/command/handler/create-auth-user.handler';
import { DeleteAuthUserHandler } from '@application/auth/command/handler/delete-auth-user.handler';
import { GoogleStrategy } from '@application/auth/google.strategy';
import { JwtStrategy } from '@application/auth/jwt.strategy';
import { LocalStrategy } from '@application/auth/local.strategy';
import { AuthService } from '@application/services/auth.service';
import { JWT_EXPIRATION_TIME, JWT_SECRET } from '@constants';
import { AuthDomainService } from '@domain/services/auth-domain.service';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { modelProviders } from '@infrastructure/models';
import { AuthRepository } from '@infrastructure/repository/auth.repository';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ProfileModule } from '@application/profile/profile.module';

export const CommandHandlers = [CreateAuthUserHandler, DeleteAuthUserHandler];

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    PassportModule,
    ProfileModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRATION_TIME },
    }),
  ],
  providers: [
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    AuthService,
    {
      provide: AuthDomainService,
      useFactory: (authRepo) => new AuthDomainService(authRepo),
      inject: ['IAuthRepository'],
    },
    {
      provide: 'IAuthRepository',
      useClass: AuthRepository,
    },
    ...modelProviders,
    ...CommandHandlers,
  ],
  exports: [AuthService, AuthDomainService, 'IAuthRepository'],
})

export class AuthModule { } 