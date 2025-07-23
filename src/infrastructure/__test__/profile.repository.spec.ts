import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { PROFILE_MODEL_PROVIDER } from '@constants';
import { Profile } from '@domain/entities/Profile';
import { Role } from '@domain/entities/enums/role.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

describe('ProfileRepository', () => {
  let repository: ProfileRepository;
  let mockProfileModel: any;

  beforeEach(async () => {
    // Create a constructor function that can be called with 'new'
    mockProfileModel = jest.fn().mockImplementation((data: any) => ({
      ...data,
      save: jest.fn().mockResolvedValue({
        toObject: jest.fn().mockReturnValue(data),
      }),
      toObject: jest.fn().mockReturnValue(data),
    }));

    // Add static methods to the constructor
    mockProfileModel.find = jest.fn();
    mockProfileModel.findOne = jest.fn();
    mockProfileModel.findOneAndUpdate = jest.fn();
    mockProfileModel.aggregate = jest.fn();
    mockProfileModel.create = jest.fn();
    mockProfileModel.deleteOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileRepository,
        {
          provide: PROFILE_MODEL_PROVIDER,
          useValue: mockProfileModel,
        },
      ],
    }).compile();

    repository = module.get<ProfileRepository>(ProfileRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new profile', async () => {
      const profileData: Partial<Profile> = {
        id: faker.string.uuid(),
        authId: faker.string.uuid(),
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
      };

      const result = await repository.create(profileData);

      expect(mockProfileModel).toHaveBeenCalledWith(profileData);
      expect(result).toEqual(profileData);
    });
  });

  describe('findAll', () => {
    it('should return all profiles', async () => {
      const mockProfiles = [
        {
          toObject: jest.fn().mockReturnValue({
            id: faker.string.uuid(),
            authId: faker.string.uuid(),
            name: faker.person.firstName(),
            lastname: faker.person.lastName(),
            age: 25,
          }),
        },
        {
          toObject: jest.fn().mockReturnValue({
            id: faker.string.uuid(),
            authId: faker.string.uuid(),
            name: faker.person.firstName(),
            lastname: faker.person.lastName(),
            age: 30,
          }),
        },
      ];

      mockProfileModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfiles),
      });

      const result = await repository.findAll();

      expect(mockProfileModel.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(mockProfiles[0].toObject).toHaveBeenCalled();
      expect(mockProfiles[1].toObject).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return profile when found', async () => {
      const profileId = faker.string.uuid();
      const mockProfile = {
        toObject: jest.fn().mockReturnValue({
          id: profileId,
          authId: faker.string.uuid(),
          name: faker.person.firstName(),
          lastname: faker.person.lastName(),
          age: 25,
        }),
      };

      mockProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfile),
      });

      const result = await repository.findById(profileId);

      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ id: profileId });
      expect(mockProfile.toObject).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return null when profile not found', async () => {
      const profileId = faker.string.uuid();

      mockProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findById(profileId);

      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ id: profileId });
      expect(result).toBeNull();
    });
  });

  describe('findByAuthId', () => {
    it('should return profile when found by authId', async () => {
      const authId = faker.string.uuid();
      const mockProfile = {
        toObject: jest.fn().mockReturnValue({
          id: faker.string.uuid(),
          authId: authId,
          name: faker.person.firstName(),
          lastname: faker.person.lastName(),
          age: 25,
        }),
      };

      mockProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfile),
      });

      const result = await repository.findByAuthId(authId);

      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ authId });
      expect(mockProfile.toObject).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return null when profile not found by authId', async () => {
      const authId = faker.string.uuid();

      mockProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByAuthId(authId);

      expect(mockProfileModel.findOne).toHaveBeenCalledWith({ authId });
      expect(result).toBeNull();
    });
  });

  describe('findByRole', () => {
    it('should return profiles with specific role', async () => {
      const mockProfiles = [
        {
          id: faker.string.uuid(),
          authId: faker.string.uuid(),
          name: faker.person.firstName(),
          lastname: faker.person.lastName(),
          age: 25,
        },
      ];

      mockProfileModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfiles),
      });

      const result = await repository.findByRole(Role.ADMIN);

      expect(mockProfileModel.aggregate).toHaveBeenCalledWith([
        {
          $lookup: {
            from: 'auths',
            localField: 'authId',
            foreignField: 'id',
            as: 'authDetails'
          }
        },
        {
          $unwind: '$authDetails'
        },
        {
          $match: {
            'authDetails.role': Role.ADMIN
          }
        },
        {
          $project: {
            authDetails: 0
          }
        }
      ]);
      expect(result).toEqual(mockProfiles);
    });
  });

  describe('update', () => {
    it('should update and return profile', async () => {
      const profileId = faker.string.uuid();
      const updateData = { name: 'Updated Name' };
      const updatedProfile = {
        toObject: jest.fn().mockReturnValue({
          id: profileId,
          authId: faker.string.uuid(),
          name: 'Updated Name',
          lastname: faker.person.lastName(),
          age: 25,
        }),
      };

      mockProfileModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedProfile),
      });

      const result = await repository.update(profileId, updateData);

      expect(mockProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: profileId },
        { $set: updateData },
        { new: true }
      );
      expect(updatedProfile.toObject).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when profile not found for update', async () => {
      const profileId = faker.string.uuid();
      const updateData = { name: 'Updated Name' };

      mockProfileModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(repository.update(profileId, updateData)).rejects.toThrow('Profile not found');
    });
  });

  describe('delete', () => {
    it('should delete profile', async () => {
      const profileId = faker.string.uuid();

      mockProfileModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await repository.delete(profileId);

      expect(mockProfileModel.deleteOne).toHaveBeenCalledWith({ id: profileId });
    });
  });
});