import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Profile } from '@domain/entities/Profile';
import { IProfileRepository } from '@domain/interfaces/repositories/profile-repository.interface';

/**
 * Domain Service for Profile Business Logic
 * Contains pure business rules and logic
 */
@Injectable()
export class ProfileDomainService {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepo: IProfileRepository
  ) { }

  /**
   * Business Logic: Validate if profile can be created
   */
  async canCreateProfile(authId: string): Promise<boolean> {
    const existingProfile = await this.profileRepo.findByAuthId(authId);
    return !existingProfile;
  }

  /**
   * Business Logic: Create profile with business validation
   */
  async createProfile(profileData: {
    authId: string;
    name: string;
    lastname: string;
    age?: number;
  }): Promise<Profile> {

    // Business rule: Each auth user can only have one profile
    if (!(await this.canCreateProfile(profileData.authId))) {
      throw new Error('Profile already exists for this user');
    }

    this.validateProfileData(profileData);

    const profile: Profile = {
      id: this.generateProfileId(),
      authId: profileData.authId,
      name: profileData.name,
      lastname: profileData.lastname,
      age: profileData.age || 0,
    };

    return await this.profileRepo.create(profile);
  }

  /**
   * Business Logic: Update profile with business validation
   */
  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<Profile> {
    const existingProfile = await this.profileRepo.findById(profileId);
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

    return await this.profileRepo.update(profileId, updates);
  }

  /**
   * Business Logic: Check if profile can be updated
   */
  canUpdateProfile(profile: Profile, requestingUserId: string, isAdmin: boolean): boolean {
    return profile.authId === requestingUserId || isAdmin;
  }

  /**
   * Business Logic: Validate profile update data
   */
  validateProfileUpdate(updates: Partial<Profile>): void {
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
   */
  isProfileComplete(profile: Profile): boolean {
    return !!(profile.name && profile.lastname && profile.age > 0);
  }

  /**
   * Business Logic: Validate profile data
   */
  validateProfileData(profileData: { name: string; lastname: string; age?: number }): void {
    this.validateName(profileData.name);
    this.validateLastname(profileData.lastname);
    if (profileData.age !== undefined) {
      this.validateAge(profileData.age);
    }
  }

  /**
   * Business Logic: Validate name
   */
  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
  }

  /**
   * Business Logic: Validate lastname
   */
  private validateLastname(lastname: string): void {
    if (!lastname || lastname.trim().length < 2) {
      throw new Error('Lastname must be at least 2 characters long');
    }
  }

  /**
   * Business Logic: Validate age
   */
  private validateAge(age: number): void {
    if (age < 0 || age > 150) {
      throw new Error('Age must be between 0 and 150');
    }
  }

  /**
   * Business Logic: Generate profile ID
   */
  generateProfileId(): string {
    return 'profile-' + uuidv4();
  }
} 