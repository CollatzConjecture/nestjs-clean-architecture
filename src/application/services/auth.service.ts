import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { CreateAuthUserCommand } from '@application/auth/command/create-auth-user.command';
import { DeleteAuthUserCommand } from '@application/auth/command/delete-auth-user.command';
import { LoginAuthDto } from '@api/dto/auth/login-auth.dto';
import { RegisterAuthDto } from '@api/dto/auth/register-auth.dto';
import {
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from '@constants';
import { AuthUser } from '@domain/entities/Auth';
import { Role } from '@domain/entities/enums/role.enum';
import { IAuthRepository } from '@domain/interfaces/repositories/auth-repository.interface';
import { IProfileRepository } from '@domain/interfaces/repositories/profile-repository.interface';
import { AuthDomainService } from '@domain/services/auth-domain.service';
import { LoggerService } from '@application/services/logger.service';
import { ProfileDomainService } from '@domain/services/profile-domain.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly authDomainService: AuthDomainService,
    private readonly profileDomainService: ProfileDomainService,
  ) {}

  async register(
    registerDto: RegisterAuthDto,
  ): Promise<{ message: string; authId: string; profileId: string }> {
    const authId = this.authDomainService.generateUserId();
    const profileId = this.profileDomainService.generateProfileId();

    await this.commandBus.execute(
      new CreateAuthUserCommand(registerDto, authId, profileId),
    );

    this.logger.logger(`Registration process started for user ${authId}.`, {
      module: 'AuthService',
      method: 'register',
    });
    return { message: 'Registration process started.', authId, profileId };
  }

  async validateUser(email: string, pass: string): Promise<AuthUser | null> {
    if (!this.authDomainService.isEmailValid(email)) {
      return null;
    }

    const auth = await this.authRepository.findByEmail(email, true);

    const validatedUser = this.authDomainService.validateUserLogin(
      email,
      pass,
      auth,
    );

    if (validatedUser && (await bcrypt.compare(pass, auth.password))) {
      return validatedUser;
    }
    return null;
  }

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;
    const context = { module: 'AuthService', method: 'login' };
    this.logger.logger(`Attempting to log in user ${email}.`, context);

    if (!this.authDomainService.isEmailValid(email)) {
      throw new UnauthorizedException('Invalid email format');
    }

    const auth = await this.authRepository.findByEmail(loginDto.email, true);

    if (!auth || !(await bcrypt.compare(loginDto.password, auth.password))) {
      this.logger.warning(`Failed login attempt for user ${email}.`, context);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: auth.email, sub: auth.id, roles: auth.role };

    this.logger.logger(`User ${email} logged in successfully.`, context);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.authRepository.removeRefreshToken(userId);
    this.logger.logger(`User ${userId} logged out successfully.`, {
      module: 'AuthService',
      method: 'logout',
    });
    return { message: 'User logged out successfully.' };
  }

  async refreshToken(user: any) {
    const payload = { username: user.username, sub: user.sub };
    this.logger.logger(`Refreshing token for user ${user.username}.`, {
      module: 'AuthService',
      method: 'refreshToken',
    });
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async findByAuthId(authId: string): Promise<AuthUser | null> {
    const auth = await this.authRepository.findById(authId);
    if (!auth) {
      this.logger.logger(`User ${authId} not found.`, {
        module: 'AuthService',
        method: 'findByAuthId',
      });
      return null;
    }
    return auth;
  }

  initiateGoogleAuth() {
    const state = crypto.randomBytes(20).toString('hex');
    const redirectUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GOOGLE_CALLBACK_URL)}` +
      `&response_type=code` +
      `&scope=openid%20email%20profile` +
      `&access_type=offline` +
      `&state=${state}`;
    this.logger.logger(`Initiating Google OAuth.`, {
      module: 'AuthService',
      method: 'initiateGoogleAuth',
    });
    return { redirectUrl, state };
  }

  async handleGoogleRedirect(code: string, state: string, storedState: string) {
    if (!state || state !== storedState) {
      this.logger.logger(`Invalid state or state mismatch.`, {
        module: 'AuthService',
        method: 'handleGoogleRedirect',
      });
      throw new UnauthorizedException('Invalid state or state mismatch.');
    }

    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    const { access_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );
    const user = userInfoResponse.data;

    const jwt = await this.findOrCreateGoogleUser({
      googleId: user.sub,
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
      picture: user.picture,
    });

    this.logger.logger(`Google user ${user.email} found or created.`, {
      module: 'AuthService',
      method: 'findOrCreateGoogleUser',
    });
    return { access_token: jwt };
  }

  async findOrCreateGoogleUser(profile: any) {
    let auth = await this.authRepository.findByGoogleId(profile.googleId);

    if (!auth) {
      auth = await this.authRepository.findByEmail(profile.email);

      if (auth) {
        auth = await this.authRepository.update(auth.id, {
          googleId: profile.googleId,
        });
      } else {
        // Check if user exists before creating
        const existingUser = await this.authRepository.findByEmail(
          profile.email,
        );
        const canCreate = this.authDomainService.canCreateUser(existingUser);
        if (!canCreate) {
          throw new Error('User already exists with this email');
        }

        const authId = this.authDomainService.generateUserId();
        const profileId = this.profileDomainService.generateProfileId();

        auth = await this.authRepository.create({
          id: authId,
          googleId: profile.googleId,
          email: profile.email,
          password: '',
          role: [Role.USER],
        });

        // Check if profile already exists before creating
        const existingProfile =
          await this.profileRepository.findByAuthId(authId);
        if (this.profileDomainService.canCreateProfile(existingProfile)) {
          await this.profileRepository.create({
            id: profileId,
            authId: authId,
            name: profile.firstName,
            lastname: profile.lastName,
            age: 0,
          });
        }
      }
    }

    const payload = { email: auth.email, sub: auth.id, roles: auth.role };
    return this.jwtService.sign(payload);
  }

  async deleteByAuthId(authId: string): Promise<{ message: string }> {
    const auth = await this.authRepository.findById(authId);
    if (!auth) {
      this.logger.logger(`Auth user ${authId} not found.`, {
        module: 'AuthService',
        method: 'deleteByAuthId',
      });
      throw new NotFoundException('Auth user not found');
    }

    const profile = await this.profileRepository.findByAuthId(auth.id);
    if (!profile) {
      this.logger.logger(`Profile for auth ${authId} not found.`, {
        module: 'AuthService',
        method: 'deleteByAuthId',
      });
      throw new NotFoundException('Profile not found');
    }

    await this.commandBus.execute(
      new DeleteAuthUserCommand(authId, profile.id),
    );

    return { message: 'User deleted successfully for auth id: ' + authId };
  }
}
