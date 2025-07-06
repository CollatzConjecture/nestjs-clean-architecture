import { v4 as uuidv4 } from 'uuid';
import { Profile } from '@domain/entities/Profile';

/**
 * Domain Service for Profile Business Logic
 * Contains pure business rules and logic
 */
export class ProfileDomainService {
  /**
   * Business Logic: Validate if profile can be created
   * @param existingProfile - Profile data from repository (passed by application layer)
   */
  canCreateProfile(existingProfile: Profile | null): boolean {
    return !existingProfile;
  }

  /**
   * Business Logic: Create profile entity with business validation
   * @param profileData - Profile creation data
   * @returns Profile entity ready for persistence
   */
  createProfileEntity(profileData: {
    authId: string;
    name: string;
    lastname: string;
    age?: number;
  }): Profile {
    this.validateProfileData(profileData);

    const profile: Profile = {
      id: this.generateProfileId(),
      authId: profileData.authId,
      name: profileData.name,
      lastname: profileData.lastname,
      age: profileData.age || 0,
    };

    return profile;
  }

  /**
   * Business Logic: Validate profile update data before persistence
   * @param existingProfile - Current profile data
   * @param updates - Updates to apply
   * @returns Validated updates
   */
  validateProfileUpdate(
    existingProfile: Profile,
    updates: Partial<Profile>,
  ): Partial<Profile> {
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    if (updates.age !== undefined) {
      this.validateAge(updates.age);
    }

    if (updates.name !== undefined) {
      this.validateName(updates.name);
    }

    if (updates.lastname !== undefined) {
      this.validateLastname(updates.lastname);
    }

    return updates;
  }

  /**
   * Business Logic: Check if profile can be updated
   * @param profile - Profile to update
   * @param requestingUserId - User requesting the update
   * @param isAdmin - Whether the requesting user is admin
   */
  canUpdateProfile(
    profile: Profile,
    requestingUserId: string,
    isAdmin: boolean,
  ): boolean {
    return profile.authId === requestingUserId || isAdmin;
  }

  /**
   * Business Logic: Validate profile update data
   * @param updates - Updates to validate
   */
  validateProfileUpdateData(updates: Partial<Profile>): void {
    if (updates.name !== undefined) {
      this.validateName(updates.name);
    }
    if (updates.lastname !== undefined) {
      this.validateLastname(updates.lastname);
    }
    if (updates.age !== undefined) {
      this.validateAge(updates.age);
    }
  }

  /**
   * Business Logic: Check if profile is complete
   * @param profile - Profile to check
   */
  isProfileComplete(profile: Profile): boolean {
    return !!(profile.name && profile.lastname && profile.age > 0);
  }

  /**
   * Business Logic: Validate profile data
   * @param profileData - Profile data to validate
   */
  validateProfileData(profileData: {
    name: string;
    lastname: string;
    age?: number;
  }): void {
    this.validateName(profileData.name);
    this.validateLastname(profileData.lastname);
    if (profileData.age !== undefined) {
      this.validateAge(profileData.age);
    }
  }

  /**
   * Business Logic: Validate name
   * @param name - Name to validate
   */
  validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
  }

  /**
   * Business Logic: Validate lastname
   * @param lastname - Lastname to validate
   */
  validateLastname(lastname: string): void {
    if (!lastname || lastname.trim().length < 2) {
      throw new Error('Lastname must be at least 2 characters long');
    }
  }

  /**
   * Business Logic: Validate age
   * @param age - Age to validate
   */
  validateAge(age: number): void {
    if (age < 0 || age > 150) {
      throw new Error('Age must be between 0 and 150');
    }
  }

  /**
   * Business Logic: Generate profile ID
   * @returns Generated profile ID
   */
  generateProfileId(): string {
    return 'profile-' + uuidv4();
  }
}
