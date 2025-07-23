import { LoggerService } from '@application/services/logger.service';
import { ProfileService } from '@application/services/profile.service';
import { PROFILE_MODEL_PROVIDER } from '@constants';
import { ProfileDomainService } from '@domain/services/profile-domain.service';
import { faker } from '@faker-js/faker';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { cloneDeep } from 'lodash';

describe('User Service', () => {
  let service: ProfileService;

  beforeAll(async () => {
    const MockProfileModel: any = jest.fn().mockImplementation((data) => ({
      save: jest.fn().mockResolvedValue({
        toObject: jest.fn().mockReturnValue(data),
      }),
      toObject: jest.fn().mockReturnValue(data),
      ...data,
    }));
    
    MockProfileModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    MockProfileModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    MockProfileModel.findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        toObject: jest.fn().mockReturnValue({}),
      }),
    });
    MockProfileModel.aggregate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    MockProfileModel.create = jest.fn().mockResolvedValue({
      toObject: jest.fn().mockReturnValue({}),
    });
    MockProfileModel.deleteOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    const userProviders = {
      provide: PROFILE_MODEL_PROVIDER,
      useValue: MockProfileModel,
    };

    const module: TestingModule = await Test
      .createTestingModule({
        providers: [
          ProfileService,
          userProviders,
          ProfileRepository,
          {
            provide: 'IProfileRepository',
            useClass: ProfileRepository,
          },
          LoggerService,
          ProfileDomainService,
        ],
      })
      .compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should create a user', async () => {
    const user = {
      id: faker.string.uuid(),
      authId: faker.string.uuid(),
      name: faker.person.fullName(),
      lastname: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
    };

    const newUser = cloneDeep(user);
    const data = await service.create(newUser);
    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.authId).toBe(user.authId);
    expect(data.name).toBe(user.name);
    expect(data.lastname).toBe(user.lastname);
    expect(data.age).toBe(user.age);
  });

  it('should find all users', async () => {
    const data = await service.find();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBeTruthy();
  });

  it('should find user by id', async () => {
    const userId = faker.string.uuid();
    const data = await service.findById(userId);
    expect(data).toBeNull(); // Mock returns null
  });

  it('should find users by role', async () => {
    const data = await service.findByRole('ADMIN' as any);
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBeTruthy();
  });

  it('should update user profile', async () => {
    const userId = faker.string.uuid();
    const updates = { name: 'Updated Name' };
    
    // Mock findByAuthId to return a profile
    const mockProfile = {
      id: faker.string.uuid(),
      authId: userId,
      name: 'Original Name',
      lastname: 'Lastname',
      age: 25,
    };
    
    jest.spyOn(service['repository'], 'findByAuthId').mockResolvedValue(mockProfile as any);
    jest.spyOn(service['repository'], 'update').mockResolvedValue({ ...mockProfile, ...updates } as any);
    
    const data = await service.updateMyProfile(updates, userId);
    expect(data).toBeDefined();
    expect(data.name).toBe('Updated Name');
  });

  it('should throw error when updating non-existent profile', async () => {
    const userId = faker.string.uuid();
    const updates = { name: 'Updated Name' };
    
    jest.spyOn(service['repository'], 'findByAuthId').mockResolvedValue(null);
    
    await expect(service.updateMyProfile(updates, userId)).rejects.toThrow('Profile not found for current user');
  });

  it('should check if profile is complete', async () => {
    const profileId = faker.string.uuid();
    const mockProfile = {
      id: profileId,
      authId: faker.string.uuid(),
      name: 'Test',
      lastname: 'User',
      age: 25,
    };
    
    jest.spyOn(service['repository'], 'findById').mockResolvedValue(mockProfile as any);
    jest.spyOn(service['profileDomainService'], 'isProfileComplete').mockReturnValue(true);
    
    const result = await service.isProfileComplete(profileId);
    expect(result).toBe(true);
  });

  it('should return false for profile completeness when profile not found', async () => {
    const profileId = faker.string.uuid();
    
    jest.spyOn(service['repository'], 'findById').mockResolvedValue(null);
    
    const result = await service.isProfileComplete(profileId);
    expect(result).toBe(false);
  });

  it('should throw error when creating duplicate profile', async () => {
    const createDto = {
      authId: faker.string.uuid(),
      name: 'Test',
      lastname: 'User',
      age: 25,
    };
    
    const existingProfile = { id: faker.string.uuid(), ...createDto };
    
    jest.spyOn(service['repository'], 'findByAuthId').mockResolvedValue(existingProfile as any);
    jest.spyOn(service['profileDomainService'], 'canCreateProfile').mockReturnValue(false);
    
    await expect(service.create(createDto)).rejects.toThrow('Profile already exists for this user');
  });
});

