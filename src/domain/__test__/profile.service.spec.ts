import { PROFILE_MODEL_PROVIDER } from '@constants';
import { ProfileService } from '@application/services/profile.service';
import { faker } from '@faker-js/faker';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { cloneDeep } from 'lodash';
import { LoggerService } from '@application/services/logger.service';
import { ProfileDomainService } from '@domain/services/profile-domain.service';

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
});

