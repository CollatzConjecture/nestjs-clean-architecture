import { AUTH_MODEL_PROVIDER, PROFILE_MODEL_PROVIDER } from '@constants';
import { Profile } from '@domain/entities/Profile';
import { Role } from '@domain/entities/enums/role.enum';
import { IProfileRepository } from '@domain/interfaces/repositories/profile-repository.interface';
import { Profile as ProfileModel } from '@infrastructure/models/profile.model';
import { Auth } from '@infrastructure/models/auth.model';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class ProfileRepository implements IProfileRepository {
  constructor(
    @Inject(PROFILE_MODEL_PROVIDER) private readonly profileModel: Model<ProfileModel>,
    @Inject(AUTH_MODEL_PROVIDER) private readonly authModel: Model<Auth>,
  ) {}

  async create(profile: Partial<Profile>): Promise<Profile> {
    const newProfile = new this.profileModel(profile);
    const savedProfile = await newProfile.save();
    return savedProfile.toObject() as Profile;
  }

  async findAll(): Promise<Profile[]> {
    const profiles = await this.profileModel.find({ deletedAt: null }).exec();
    return profiles.map(profile => profile.toObject() as Profile);
  }

  async findById(id: string): Promise<Profile | null> {
    const profile = await this.profileModel.findOne({ id, deletedAt: null }).exec();
    return profile ? profile.toObject() as Profile : null;
  }

  async findByAuthId(authId: string): Promise<Profile | null> {
    const profile = await this.profileModel.findOne({ authId, deletedAt: null }).exec();
    return profile ? profile.toObject() as Profile : null;
  }

  async findByRole(role: Role): Promise<Profile[]> {
    const authsWithRole = await this.authModel
      .find({ role, deletedAt: null })
      .select('id')
      .exec();

    if (authsWithRole.length === 0) {
      return [];
    }

    const authIds = authsWithRole.map(auth => auth.id);
    const profiles = await this.profileModel
      .find({ authId: { $in: authIds }, deletedAt: null })
      .exec();

    return profiles.map(profile => profile.toObject() as Profile);
  }

  async update(id: string, profileData: Partial<Profile>): Promise<Profile> {
    const updatedProfile = await this.profileModel.findOneAndUpdate(
      { id, deletedAt: null },
      { $set: profileData },
      { new: true }
    ).exec();
    
    if (!updatedProfile) {
      throw new Error('Profile not found');
    }
    
    return updatedProfile.toObject() as Profile;
  }

  async delete(id: string): Promise<void> {
    await this.profileModel.updateOne(
      { id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    ).exec();
  }
}
