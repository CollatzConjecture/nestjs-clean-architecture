import * as mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

export const ProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  authId: { type: String, required: true, unique: true },
  name: String,
  lastname: String,
  age: Number,
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

export interface Profile extends mongoose.Document {
  readonly id: string;
  readonly authId: string;
  readonly name: string;
  readonly lastname?: string;
  readonly age?: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date | null;
}

export class ProfileModel {
  constructor(profile: ProfileModel | any) {
    this.id = faker.string.uuid();
    this.authId = profile.authId;
    this.name = profile.name;
    this.lastname = profile.lastname;
    this.age = profile.age;
    this.deletedAt = null;
  }

  id?: string;
  authId: string;
  name: string;
  lastname?: string;
  age?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  save(): ProfileModel {
    return this;
  }
}
