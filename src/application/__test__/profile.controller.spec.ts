import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { has, cloneDeep } from 'lodash';
import { TestingModule } from '@nestjs/testing/testing-module';
import { ProfileController } from '@api/controllers/profile.controller';
import { ProfileService } from '@application/services/profile.service';
import { ProfileModel } from '@infrastructure/models/profile.model';
import { Profile } from '@domain/entities/Profile';
import { PROFILE_MODEL_PROVIDER } from '@constants';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { LoggerService } from '@application/services/logger.service';
import { ProfileDomainService } from '@domain/services/profile-domain.service';
import { ResponseService } from '@application/services/response.service';

describe('Profile Controller', () => {
  let controller: ProfileController;
  let service: ProfileService;
  const profileModel: any = ProfileModel;

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

    const profileProviders = {
      provide: PROFILE_MODEL_PROVIDER,
      useValue: mockProfileModel,
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
});
