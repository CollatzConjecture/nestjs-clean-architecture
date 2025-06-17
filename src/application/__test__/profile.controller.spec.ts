import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { has, cloneDeep } from 'lodash';
import { TestingModule } from '@nestjs/testing/testing-module';
import { ProfileController } from '@application/controllers/profile.controller';
import { ProfileService } from '@domain/services/profile.service';
import { ProfileModel } from '@infrastructure/models/profile.model';
import { Profile } from '@domain/entities/Profile';
import { PROFILE_MODEL_PROVIDER } from '@constants';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';

describe('Profile Controller', () => {
  let controller: ProfileController;
  let service: ProfileService;
  const profileModel: any = ProfileModel;

  beforeAll(async () => {
    const profileProviders = {
      provide: PROFILE_MODEL_PROVIDER,
      useValue: profileModel,
    };

    const module: TestingModule = await Test
      .createTestingModule({
        controllers: [ProfileController],
        providers: [
          ProfileService,
          ProfileRepository,
          profileProviders,
        ],
      })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  it('should create a profile', async () => {
    const profile: Profile = {
      id: faker.string.uuid(),
      name: faker.person.firstName(),
      lastname: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
    };
    const newProfile = cloneDeep(profile);
    jest.spyOn(service, 'create').mockImplementation(async () => profile);
    const data = await controller.create(newProfile);
    expect(data).toBeDefined();
    expect(has(data, 'id')).toBeTruthy();
    Object.keys(data).forEach((key) => {
      expect(data[key]).toBe(profile[key]);
    });
  });

  it('should return Hello World', async () => {
    const data = await controller.get();
    expect(data).toBeDefined();
    expect(data).toBe('Hello World!');
  });

  it('should return all profiles', async () => {
    const profiles: Profile[] = [
      {
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
      },
      {
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
      },
    ];
    
    jest.spyOn(service, 'find').mockImplementation(async () => profiles);
    const data = await controller.getAll();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(2);
  });
});
