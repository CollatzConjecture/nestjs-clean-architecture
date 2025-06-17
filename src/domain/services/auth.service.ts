import { Injectable, UnauthorizedException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ProfileService } from './profile.service';
import { RegisterAuthDto } from '@application/dto/auth/register-auth.dto';
import { Profile } from '@domain/entities/Profile';
import { AuthRepository } from '@infrastructure/repository/auth.repository';
import { v4 } from 'uuid';
import { AuthUser } from '@domain/entities/Auth';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAuthUserCommand } from '@application/auth/command/create-auth-user.command';
import { LoginAuthDto } from '@application/dto/auth/login-auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly profileService: ProfileService,
  ) {}

  async register(registerDto: RegisterAuthDto): Promise<{ message: string; userId: string }> {
    const userId = v4();
    await this.commandBus.execute(
      new CreateAuthUserCommand(registerDto, userId)
    );
    
    this.logger.log(`Registration process started for user ${userId}.`);
    return { message: 'Registration process started.', userId };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const auth = await this.authRepository.findByEmail(email, true);
    
    if (auth && await bcrypt.compare(pass, auth.password)) {
      const user = await this.profileService.findById(auth.id);
      return user;
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
} 