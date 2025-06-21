import { PROFILE_MODEL_PROVIDER } from '@constants';
import { Profile } from '@domain/entities/Profile';
import { Profile as ProfileModel } from '@infrastructure/models/profile.model';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class ProfileRepository {
  constructor(@Inject(PROFILE_MODEL_PROVIDER) private readonly profileModel: Model<ProfileModel>) {}

  async create(profile: Partial<Profile>): Promise<Profile> {
    const newProfile = new this.profileModel(profile);
    const savedProfile = await newProfile.save();
    return savedProfile.toObject() as Profile;
  }

  async find(): Promise<Profile[]> {
    const profiles = await this.profileModel.find().exec();
    return profiles.map(profile => profile.toObject() as Profile);
  }

  async findById(id: string): Promise<Profile | null> {
    const profile = await this.profileModel.findOne({ id }).exec();
    return profile ? profile.toObject() as Profile : null;
  }
}
