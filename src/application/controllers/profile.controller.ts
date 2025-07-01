import { Roles } from '@application/auth/decorators/roles.decorator';
import { RolesGuard } from '@application/auth/guards/roles.guard';
import { CreateProfileDto } from '@application/dto/create-profile.dto';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';
import { Role } from '@domain/entities/enums/role.enum';
import { Profile } from '@domain/entities/Profile';
import { ProfileService } from '@domain/services/profile.service';
import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('profile')
@UseInterceptors(LoggingInterceptor)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users', type: [Profile] })
  async getAll(): Promise<Profile[]> {
    return await this.profileService.find();
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get('admins')
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, description: 'Returns all admin users', type: [Profile] })
  async getAdmins(): Promise<Profile[]> {
    return await this.profileService.findByRole(Role.ADMIN);
  }

  @Post('')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created', type: Profile })
  async create(@Body() profile: CreateProfileDto): Promise<Profile> {
    return await this.profileService.create(profile);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Profile id is required');
    }
    return this.profileService.findById(id);
  }
}
