import { LoggerService, Context } from '@domain/services/logger.service';
import { Controller, Get, Post, Body, UseInterceptors, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from '@domain/services/profile.service';
import { CreateProfileDto } from '@application/dto/create-profile.dto';
import { Profile } from '@domain/entities/Profile';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
@UseInterceptors(LoggingInterceptor)
export class ProfileController {
  private Log: LoggerService = new LoggerService('createOperation');
  constructor(private readonly profileService: ProfileService) {}

  @Get('/hello')
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Returns hello world message' })
  get(): string {
    const context: Context = { module: 'HelloController', method: 'get' };
    this.Log.logger('Hello World!', context);
    return 'Hello World!';
  }

  @Get('/all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users', type: [Profile] })
  async getAll(): Promise<Profile[]> {
    const context: Context = { module: 'HelloController', method: 'getAll' };
    this.Log.logger('Hello World!', context);
    return await this.profileService.find();
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created', type: Profile })
  @Post('/')
  async create(@Body() profile: CreateProfileDto): Promise<Profile> {
    const context: Context = { module: 'HelloController', method: 'create' };
    this.Log.logger(profile, context);
    return await this.profileService.create(profile);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Request() req) {
    return req.user;
  }
}
