import { CreateAuthUserCommand } from '@application/auth/command/create-auth-user.command';
import { LoginAuthDto } from '@application/dto/auth/login-auth.dto';
import { RegisterAuthDto } from '@application/dto/auth/register-auth.dto';
import { Auth } from '@infrastructure/models/auth.model';
import { Profile } from '@domain/entities/Profile';
import { AuthRepository } from '@infrastructure/repository/auth.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { LoggerService } from './logger.service';

@Injectable()
export class AuthService {
  private readonly logger: LoggerService = new LoggerService('AuthService');

  constructor(
    private readonly commandBus: CommandBus,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto): Promise<{ message: string; authId: string; profileId: string }> {
    const authId = "auth-" + v4();
    const profileId = "profile-" + v4();
    await this.commandBus.execute(
      new CreateAuthUserCommand(registerDto, authId, profileId)
    );
    
    this.logger.logger(`Registration process started for user ${authId}.`);
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
    const auth = await this.authRepository.findByEmail(loginDto.email, true);

    if (!auth || !(await bcrypt.compare(loginDto.password, auth.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: auth.email, sub: auth.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async refreshToken(user: any) {
    const payload = { username: user.username, sub: user.sub };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async findByAuthId(authId: string): Promise<Profile | null> {
    const auth = await this.authRepository.findByAuthId(authId);
    if (!auth) {
      return null;
    }
    return auth.toObject();
  }
} 