import { LoginAuthDto } from '@application/dto/auth/login-auth.dto';
import { RegisterAuthDto } from '@application/dto/auth/register-auth.dto';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';
import { AuthService } from '@domain/services/auth.service';
import { Body, Controller, Delete, Get, Param, Post, Query, Req, Request, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request as ExpressRequest, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
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
  @ApiResponse({ status: 200, description: 'New access token generated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth(@Res() res: Response) {
    const { redirectUrl, state } = this.authService.initiateGoogleAuth();
    res.cookie('oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax' });
    res.redirect(redirectUrl);
  }

  @Get('google/redirect')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async googleAuthRedirect(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const storedState = req.cookies['oauth_state'];
    const result = await this.authService.handleGoogleRedirect(code, state, storedState);
    
    // Clear the cookie after use
    res.clearCookie('oauth_state');
    
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile by auth id' })
  @ApiResponse({ status: 200, description: 'Returns user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Param('id') id: string) {
    return this.authService.findByAuthId(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user profile by auth id' })
  @ApiResponse({ status: 200, description: 'User profile deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteProfile(@Param('id') id: string) {
    return this.authService.deleteByAuthId(id);
  }
} 