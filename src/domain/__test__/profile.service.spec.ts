import { PROFILE_MODEL_PROVIDER } from '@constants';
import { ProfileService } from '@domain/services/profile.service';
import { faker } from '@faker-js/faker';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { cloneDeep } from 'lodash';

describe('User Service', () => {
  let service: ProfileService;
  let repository: ProfileRepository;

  beforeAll(async () => {
    const userProviders = {
      provide: PROFILE_MODEL_PROVIDER,
      useValue: {
        new: jest.fn().mockResolvedValue({}),
        constructor: jest.fn().mockResolvedValue({}),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
        exec: jest.fn(),
      },
    };

    const module: TestingModule = await Test
      .createTestingModule({
        providers: [
          ProfileService,
          ProfileRepository,
          userProviders,
        ],
      })
      .compile();

    service = module.get<ProfileService>(ProfileService);
    repository = module.get<ProfileRepository>(ProfileRepository);
  });

  it('should create a user', async () => {
    const user = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      lastname: faker.person.lastName(),
      age: faker.number.int(),
    };

    const newUser = cloneDeep(user);
    jest.spyOn(repository, 'create').mockImplementation(async () => user);
    const data = await service.create(newUser);
    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
    Object.keys(data).forEach((key) => {
      expect(data[key]).toBe(user[key]);
    });
  });
});

