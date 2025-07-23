import { ProfileController } from '@api/controllers/profile.controller';
import { ProfileService } from '@application/services/profile.service';
import { ResponseService } from '@application/services/response.service';
import { PROFILE_MODEL_PROVIDER } from '@constants';
import { Profile } from '@domain/entities/Profile';
import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { cloneDeep, has } from 'lodash';

describe('Profile Controller', () => {
  let controller: ProfileController;
  let service: ProfileService;

  beforeAll(async () => {
    const mockProfileModel = {
      new: jest.fn().mockResolvedValue({}),
      constructor: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      findOneAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      }),
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
      create: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue({}),
      deleteOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      }),
    };

    const module: TestingModule = await Test
      .createTestingModule({
        controllers: [ProfileController],
        providers: [
          {
            provide: ProfileService,
            useValue: {
              create: jest.fn(),
              find: jest.fn(),
              findById: jest.fn(),
              findByRole: jest.fn(),
              updateMyProfile: jest.fn(),
              isProfileComplete: jest.fn(),
            },
          },
          ResponseService,
        ],
      })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  it('should create a profile', async () => {
    const profile: Profile = {
      id: faker.string.uuid(),
      authId: faker.string.uuid(),
      name: faker.person.firstName(),
      lastname: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
    };
    const newProfile = cloneDeep(profile);
    jest.spyOn(service, 'create').mockImplementation(async () => profile);
    const data = await controller.create(newProfile);
    expect(data).toBeDefined();
    expect(has(data, 'data')).toBeTruthy();
    expect(data.data.id).toBe(profile.id);
    expect(data.message).toBe('Profile created successfully');
  });

  it('should return all profiles', async () => {
    const profiles: Profile[] = [
      {
        id: faker.string.uuid(),
        authId: faker.string.uuid(),
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
      },
      {
        id: faker.string.uuid(),
        authId: faker.string.uuid(),
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
      },
    ];

    jest.spyOn(service, 'find').mockImplementation(async () => profiles);
    const data = await controller.getAll();
    expect(data).toBeDefined();
    expect(has(data, 'data')).toBeTruthy();
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBe(2);
    expect(data.message).toBe('All profiles retrieved successfully');
  });

  it('should get profile by id', async () => {
    const profile: Profile = {
      id: faker.string.uuid(),
      authId: faker.string.uuid(),
      name: faker.person.firstName(),
      lastname: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
    };

    jest.spyOn(service, 'findById').mockImplementation(async () => profile);
    const data = await controller.getProfile(profile.id);
    expect(data).toBeDefined();
    expect(has(data, 'data')).toBeTruthy();
    expect(data.data.id).toBe(profile.id);
    expect(data.message).toBe('Profile retrieved successfully');
  });

  it('should throw BadRequestException when id is empty', async () => {
    await expect(controller.getProfile('')).rejects.toThrow('Profile id is required');
  });

  it('should throw NotFoundException when profile not found', async () => {
    const profileId = faker.string.uuid();
    jest.spyOn(service, 'findById').mockImplementation(async () => null);
    
    await expect(controller.getProfile(profileId)).rejects.toThrow('Profile not found');
  });

  it('should get admin profiles', async () => {
    const adminProfiles: Profile[] = [
      {
        id: faker.string.uuid(),
        authId: faker.string.uuid(),
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
      },
    ];

    jest.spyOn(service, 'findByRole').mockImplementation(async () => adminProfiles);
    const data = await controller.getAdmins();
    expect(data).toBeDefined();
    expect(has(data, 'data')).toBeTruthy();
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBe(1);
    expect(data.message).toBe('Admin profiles retrieved successfully');
  });

  it('should update my profile', async () => {
    const userId = faker.string.uuid();
    const updates = { name: 'Updated Name' };
    const updatedProfile: Profile = {
      id: faker.string.uuid(),
      authId: userId,
      name: 'Updated Name',
      lastname: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
    };

    jest.spyOn(service, 'updateMyProfile').mockImplementation(async () => updatedProfile);
    const data = await controller.updateMyProfile(updates, userId);
    expect(data).toBeDefined();
    expect(has(data, 'data')).toBeTruthy();
    expect(data.data.name).toBe('Updated Name');
    expect(data.message).toBe('Profile updated successfully');
  });
});
