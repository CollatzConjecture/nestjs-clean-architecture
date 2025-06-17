import * as mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

export const ProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  lastname: String,
  age: Number,
});

export interface Profile extends mongoose.Document {
    readonly id: string;
    readonly name: string;
    readonly lastname: string;
    readonly age: number;
}

export class ProfileModel {
  constructor(profile: ProfileModel | any) {
    this.id = faker.string.uuid();
    this.name = profile.name;
    this.lastname = profile.lastname;
    this.age = profile.age;
  }

  id?: string;
  name: string;
  lastname: string;
  age: number;

  save(): ProfileModel {
    return this;
  } 
}
