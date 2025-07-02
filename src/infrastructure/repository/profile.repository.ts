import { PROFILE_MODEL_PROVIDER } from '@constants';
import { Profile } from '@domain/entities/Profile';
import { Role } from '@domain/entities/enums/role.enum';
import { IProfileRepository } from '@domain/interfaces/repositories/profile-repository.interface';
import { Profile as ProfileModel } from '@infrastructure/models/profile.model';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class ProfileRepository implements IProfileRepository {
  constructor(@Inject(PROFILE_MODEL_PROVIDER) private readonly profileModel: Model<ProfileModel>) {}

  async create(profile: Partial<Profile>): Promise<Profile> {
    const newProfile = new this.profileModel(profile);
    const savedProfile = await newProfile.save();
    return savedProfile.toObject() as Profile;
  }

  async findAll(): Promise<Profile[]> {
    const profiles = await this.profileModel.find().exec();
    return profiles.map(profile => profile.toObject() as Profile);
  }

  async findById(id: string): Promise<Profile | null> {
    const profile = await this.profileModel.findOne({ id }).exec();
    return profile ? profile.toObject() as Profile : null;
  }

  async findByAuthId(authId: string): Promise<Profile | null> {
    const profile = await this.profileModel.findOne({ authId }).exec();
    return profile ? profile.toObject() as Profile : null;
  }

  async findByRole(role: Role): Promise<Profile[]> {
    const profiles = await this.profileModel.aggregate([
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
          'authDetails.role': role
        }
      },
      {
        $project: {
          authDetails: 0
        }
      }
    ]).exec();
    return profiles;
  }

  async update(id: string, profileData: Partial<Profile>): Promise<Profile> {
    const updatedProfile = await this.profileModel.findOneAndUpdate(
      { id },
      { $set: profileData },
      { new: true }
    ).exec();
    
    if (!updatedProfile) {
      throw new Error('Profile not found');
    }
    
    return updatedProfile.toObject() as Profile;
  }

  async delete(id: string): Promise<void> {
    await this.profileModel.deleteOne({ id }).exec();
  }
}
