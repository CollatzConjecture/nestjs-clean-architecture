import { Controller, Post, Body, UseGuards, Request, Get, UseInterceptors, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '@domain/services/auth.service';
import { RegisterAuthDto } from '@application/dto/auth/register-auth.dto';
import { LoginAuthDto } from '@application/dto/auth/login-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.'})
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out the current user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refresh-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token generated.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile by auth id' })
  @ApiResponse({ status: 200, description: 'Returns user profile.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Param('id') id: string) {
    return this.authService.findByAuthId(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user profile by auth id' })
  @ApiResponse({ status: 200, description: 'User profile deleted.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteProfile(@Param('id') id: string) {
    return this.authService.deleteByAuthId(id);
  }
} 