import { LoggerService, Context } from '@domain/services/logger.service';
import { Controller, Get, Post, Body, UseInterceptors, UseGuards, Request, Param, BadRequestException } from '@nestjs/common';
import { ProfileService } from '@domain/services/profile.service';
import { CreateProfileDto } from '@application/dto/create-profile.dto';
import { Profile } from '@domain/entities/Profile';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@application/auth/decorators/roles.decorator';
import { Role } from '@domain/entities/enums/role.enum';
import { RolesGuard } from '@application/auth/guards/roles.guard';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('profile')
@UseInterceptors(LoggingInterceptor)
export class ProfileController {
  private Log: LoggerService = new LoggerService('ProfileController');
  constructor(private readonly profileService: ProfileService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users', type: [Profile] })
  async getAll(): Promise<Profile[]> {
    const context: Context = { module: 'ProfileController', method: 'getAll' };
    this.Log.logger('Getting All Profiles!', context);
    return await this.profileService.find();
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get('admins')
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, description: 'Returns all admin users', type: [Profile] })
  async getAdmins(): Promise<Profile[]> {
    const context: Context = { module: 'ProfileController', method: 'getAdmins' };
    this.Log.logger('Getting All Admin Profiles!', context);
    return await this.profileService.findByRole(Role.ADMIN);
  }

  @Post('')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created', type: Profile })
  async create(@Body() profile: CreateProfileDto): Promise<Profile> {
    const context: Context = { module: 'ProfileController', method: 'create' };
    this.Log.logger(profile, context);
    return await this.profileService.create(profile);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Param('id') id: string) {
    const context: Context = { module: 'ProfileController', method: 'getProfile' };
    this.Log.logger(`Fetching profile for id: ${id}`, context);
    if (!id) {
      this.Log.warning('No id provided', context);
      throw new BadRequestException('Profile id is required');
    }
    return this.profileService.findById(id);
  }
}
