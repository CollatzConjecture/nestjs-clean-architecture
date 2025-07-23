import { SuccessResponseDto } from '@api/dto/common/api-response.dto';
import { CreateProfileDto } from '@api/dto/create-profile.dto';
import { UpdateProfileDto } from '@api/dto/update-profile.dto';
import { Roles } from '@application/auth/decorators/roles.decorator';
import { RolesGuard } from '@application/auth/guards/roles.guard';
import { CurrentUserId } from '@application/decorators/current-user.decorator';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';
import { ProfileService } from '@application/services/profile.service';
import { ResponseService } from '@application/services/response.service';
import { Role } from '@domain/entities/enums/role.enum';
import { Profile } from '@domain/entities/Profile';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'profile',
  version: '1',
})
@UseInterceptors(LoggingInterceptor)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly responseService: ResponseService,
  ) { }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users', type: [Profile] })
  async getAll(): Promise<SuccessResponseDto<Profile[]>> {
    const profiles = await this.profileService.find();
    return this.responseService.retrieved(profiles, 'All profiles retrieved successfully');
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get('admins')
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, description: 'Returns all admin users', type: [Profile] })
  async getAdmins(): Promise<SuccessResponseDto<Profile[]>> {
    const admins = await this.profileService.findByRole(Role.ADMIN);
    return this.responseService.retrieved(admins, 'Admin profiles retrieved successfully');
  }

  @Post('')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
    type: Profile,
  })
  async create(@Body() profile: CreateProfileDto): Promise<SuccessResponseDto<Profile>> {
    const newProfile = await this.profileService.create(profile);
    return this.responseService.created(newProfile, 'Profile created successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Profile id is required');
    }

    const profile = await this.profileService.findById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.responseService.retrieved(profile, 'Profile retrieved successfully');
  }

  @Put('me')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: Profile })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateMyProfile(
    @Body() updates: UpdateProfileDto,
    @CurrentUserId() requestingUserId: string,
  ): Promise<SuccessResponseDto<Profile>> {
    const updatedProfile = await this.profileService.updateMyProfile(updates, requestingUserId);
    return this.responseService.updated(updatedProfile, 'Profile updated successfully');
  }
}
