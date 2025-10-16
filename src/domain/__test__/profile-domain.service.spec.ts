import { ProfileDomainService } from '@domain/services/profile-domain.service';
import { Profile } from '@domain/entities/Profile';
import { faker } from '@faker-js/faker';

describe('ProfileDomainService', () => {
  let service: ProfileDomainService;

  beforeEach(() => {
    service = new ProfileDomainService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('canCreateProfile', () => {
    it('should return true when no existing profile', () => {
      const result = service.canCreateProfile(null);
      expect(result).toBe(true);
    });

    it('should return false when profile already exists', () => {
      const existingProfile: Profile = {
        id: faker.string.uuid(),
        authId: faker.string.uuid(),
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        age: 25,
      };
      const result = service.canCreateProfile(existingProfile);
      expect(result).toBe(false);
    });
  });

  describe('createProfileEntity', () => {
    it('should create profile entity with valid data', () => {
      const profileData = {
        authId: faker.string.uuid(),
        name: 'John',
        lastname: 'Doe',
        age: 25,
      };

      const result = service.createProfileEntity(profileData);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^profile-/);
      expect(result.authId).toBe(profileData.authId);
      expect(result.name).toBe(profileData.name);
      expect(result.lastname).toBe(profileData.lastname);
      expect(result.age).toBe(profileData.age);
    });

    it('should create profile entity with default age when not provided', () => {
      const profileData = {
        authId: faker.string.uuid(),
        name: 'John',
        lastname: 'Doe',
      };

      const result = service.createProfileEntity(profileData);

      expect(result.age).toBe(0);
    });

    it('should throw error for invalid name', () => {
      const profileData = {
        authId: faker.string.uuid(),
        name: 'J',
        lastname: 'Doe',
        age: 25,
      };

      expect(() => service.createProfileEntity(profileData)).toThrow(
        'Name must be at least 2 characters long',
      );
    });

    it('should throw error for invalid lastname', () => {
      const profileData = {
        authId: faker.string.uuid(),
        name: 'John',
        lastname: 'D',
        age: 25,
      };

      expect(() => service.createProfileEntity(profileData)).toThrow(
        'Lastname must be at least 2 characters long',
      );
    });
  });

  describe('validateProfileUpdate', () => {
    const existingProfile: Profile = {
      id: faker.string.uuid(),
      authId: faker.string.uuid(),
      name: 'John',
      lastname: 'Doe',
      age: 25,
    };

    it('should validate and return updates for valid data', () => {
      const updates = { name: 'Jane', age: 30 };
      const result = service.validateProfileUpdate(existingProfile, updates);
      expect(result).toEqual(updates);
    });

    it('should throw error when profile not found', () => {
      const updates = { name: 'Jane' };
      expect(() => service.validateProfileUpdate(null as any, updates)).toThrow(
        'Profile not found',
      );
    });

    it('should throw error for invalid age in updates', () => {
      const updates = { age: -5 };
      expect(() =>
        service.validateProfileUpdate(existingProfile, updates),
      ).toThrow('Age must be between 0 and 150');
    });

    it('should throw error for invalid name in updates', () => {
      const updates = { name: 'J' };
      expect(() =>
        service.validateProfileUpdate(existingProfile, updates),
      ).toThrow('Name must be at least 2 characters long');
    });

    it('should throw error for invalid lastname in updates', () => {
      const updates = { lastname: 'D' };
      expect(() =>
        service.validateProfileUpdate(existingProfile, updates),
      ).toThrow('Lastname must be at least 2 characters long');
    });
  });

  describe('canUpdateProfile', () => {
    const profile: Profile = {
      id: faker.string.uuid(),
      authId: 'user123',
      name: 'John',
      lastname: 'Doe',
      age: 25,
    };

    it('should return true when user is updating their own profile', () => {
      const result = service.canUpdateProfile(profile, 'user123', false);
      expect(result).toBe(true);
    });

    it('should return true when admin is updating any profile', () => {
      const result = service.canUpdateProfile(profile, 'admin456', true);
      expect(result).toBe(true);
    });

    it('should return false when non-admin user tries to update another profile', () => {
      const result = service.canUpdateProfile(profile, 'otheruser789', false);
      expect(result).toBe(false);
    });
  });

  describe('isProfileComplete', () => {
    it('should return true for complete profile', () => {
      const profile: Profile = {
        id: faker.string.uuid(),
        authId: faker.string.uuid(),
        name: 'John',
        lastname: 'Doe',
        age: 25,
      };
      const result = service.isProfileComplete(profile);
      expect(result).toBe(true);
    });

    it('should return false when name is missing', () => {
      const profile: Profile = {
        id: faker.string.uuid(),
        authId: faker.string.uuid(),
        name: '',
        lastname: 'Doe',
        age: 25,
      };
      const result = service.isProfileComplete(profile);
      expect(result).toBe(false);
    });

    it('should return false when lastname is missing', () => {
      const profile: Profile = {
        id: faker.string.uuid(),
        authId: faker.string.uuid(),
        name: 'John',
        lastname: '',
        age: 25,
      };
      const result = service.isProfileComplete(profile);
      expect(result).toBe(false);
    });

    it('should return false when age is 0', () => {
      const profile: Profile = {
        id: faker.string.uuid(),
        authId: faker.string.uuid(),
        name: 'John',
        lastname: 'Doe',
        age: 0,
      };
      const result = service.isProfileComplete(profile);
      expect(result).toBe(false);
    });
  });

  describe('validation methods', () => {
    it('should validate name correctly', () => {
      expect(() => service.validateName('John')).not.toThrow();
      expect(() => service.validateName('J')).toThrow(
        'Name must be at least 2 characters long',
      );
      expect(() => service.validateName('')).toThrow(
        'Name must be at least 2 characters long',
      );
      expect(() => service.validateName('  ')).toThrow(
        'Name must be at least 2 characters long',
      );
    });

    it('should validate lastname correctly', () => {
      expect(() => service.validateLastname('Doe')).not.toThrow();
      expect(() => service.validateLastname('D')).toThrow(
        'Lastname must be at least 2 characters long',
      );
      expect(() => service.validateLastname('')).toThrow(
        'Lastname must be at least 2 characters long',
      );
      expect(() => service.validateLastname('  ')).toThrow(
        'Lastname must be at least 2 characters long',
      );
    });

    it('should validate age correctly', () => {
      expect(() => service.validateAge(25)).not.toThrow();
      expect(() => service.validateAge(0)).not.toThrow();
      expect(() => service.validateAge(150)).not.toThrow();
      expect(() => service.validateAge(-1)).toThrow(
        'Age must be between 0 and 150',
      );
      expect(() => service.validateAge(151)).toThrow(
        'Age must be between 0 and 150',
      );
    });
  });

  describe('validateProfileUpdateData', () => {
    it('should validate all update fields', () => {
      const updates = { name: 'John', lastname: 'Doe', age: 25 };
      expect(() => service.validateProfileUpdateData(updates)).not.toThrow();
    });

    it('should throw error for invalid update data', () => {
      const updates = { name: 'J', lastname: 'Doe', age: 25 };
      expect(() => service.validateProfileUpdateData(updates)).toThrow(
        'Name must be at least 2 characters long',
      );
    });
  });

  describe('generateProfileId', () => {
    it('should generate profile ID with correct prefix', () => {
      const id = service.generateProfileId();
      expect(id).toMatch(
        /^profile-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it('should generate unique IDs', () => {
      const id1 = service.generateProfileId();
      const id2 = service.generateProfileId();
      expect(id1).not.toBe(id2);
    });
  });
});
