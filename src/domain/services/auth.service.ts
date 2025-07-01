import { CreateAuthUserCommand } from '@application/auth/command/create-auth-user.command';
import { LoginAuthDto } from '@application/dto/auth/login-auth.dto';
import { RegisterAuthDto } from '@application/dto/auth/register-auth.dto';
import { Auth } from '@infrastructure/models/auth.model';
import { AuthRepository } from '@infrastructure/repository/auth.repository';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { LoggerService } from './logger.service';
import { DeleteAuthUserCommand } from '@application/auth/command/delete-auth-user.command';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { Role } from '@domain/entities/enums/role.enum';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from '@constants';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly profileRepository: ProfileRepository,
    private readonly logger: LoggerService,
  ) {}

  async register(registerDto: RegisterAuthDto): Promise<{ message: string; authId: string; profileId: string }> {
    const authId = "auth-" + v4();
    const profileId = "profile-" + v4();
    await this.commandBus.execute(
      new CreateAuthUserCommand(registerDto, authId, profileId)
    );

    this.logger.logger(`Registration process started for user ${authId}.`, { module: 'AuthService', method: 'register' });
    return { message: 'Registration process started.', authId, profileId };
  }

  async validateUser(email: string, pass: string): Promise<Auth | null> {
    const auth = await this.authRepository.findByEmail(email, true);
    if (auth && await bcrypt.compare(pass, auth.password)) {
      return auth;
    }
    return null;
  }

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;
    const context = { module: 'AuthService', method: 'login' };
    this.logger.logger(`Attempting to log in user ${email}.`, context);

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
    this.logger.logger(`User ${userId} logged out successfully.`, { module: 'AuthService', method: 'logout' });
    return { message: 'User logged out successfully.' };
  }

  async refreshToken(user: any) {
    const payload = { username: user.username, sub: user.sub };
    this.logger.logger(`Refreshing token for user ${user.username}.`, { module: 'AuthService', method: 'refreshToken' });
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async findByAuthId(authId: string): Promise<Auth | null> {
    const auth = await this.authRepository.findById(authId);
    if (!auth) {
      this.logger.logger(`User ${authId} not found.`, { module: 'AuthService', method: 'findByAuthId' });
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
    this.logger.logger(`Initiating Google OAuth.`, { module: 'AuthService', method: 'initiateGoogleAuth' });
    return { redirectUrl, state };
  }

  async handleGoogleRedirect(code: string, state: string, storedState: string) {
    if (!state || state !== storedState) {
      this.logger.logger(`Invalid state or state mismatch.`, { module: 'AuthService', method: 'handleGoogleRedirect' });
      throw new UnauthorizedException('Invalid state or state mismatch.');
    }
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token } = tokenResponse.data;

    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = userInfoResponse.data;

    const jwt = await this.findOrCreateGoogleUser({
      googleId: user.sub,
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
      picture: user.picture,
    });

    this.logger.logger(`Google user ${user.email} found or created.`, { module: 'AuthService', method: 'findOrCreateGoogleUser' });
    return { access_token: jwt };
  }

  async findOrCreateGoogleUser(profile: any) {
    let auth = await this.authRepository.findByGoogleId(profile.googleId);

    if (!auth) {
      auth = await this.authRepository.findByEmail(profile.email);

      if (auth) {
        auth.googleId = profile.googleId;
        await auth.save();
      } else {
        const authId = "auth-" + v4();
        const profileId = "profile-" + v4();

        const registerDto = {
          name: profile.firstName,
          lastname: profile.lastName,
          email: profile.email,
        };

        auth = await this.authRepository.create({
          id: authId,
          googleId: profile.googleId,
          email: profile.email,
          role: [Role.USER],
        });

        await this.profileRepository.create({
          id: profileId,
          authId: authId,
          name: profile.firstName,
          lastname: profile.lastName,
        });
      }
    }

    const payload = { email: auth.email, sub: auth.id, roles: auth.role };
    return this.jwtService.sign(payload);
  }

  async deleteByAuthId(authId: string): Promise<{ message: string }> {
    const auth = await this.authRepository.findById(authId);
    const profile = await this.profileRepository.findByAuthId(auth.id);
    if (!auth || !profile) {
      this.logger.logger(`User ${authId} not found.`, { module: 'AuthService', method: 'deleteByAuthId' });
      throw new NotFoundException('User not found');
    }

    await this.commandBus.execute(
      new DeleteAuthUserCommand(authId, profile.id)
    );

    return { message: 'User deleted successfully for auth id: ' + authId };
  }
} 