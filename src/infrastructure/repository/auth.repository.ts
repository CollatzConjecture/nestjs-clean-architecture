import { AUTH_MODEL_PROVIDER } from '@constants';
import { AuthUser } from '@domain/entities/Auth';
import { IAuthRepository } from '@domain/interfaces/repositories/auth-repository.interface';
import { Auth, createBlindIndex } from '@infrastructure/models/auth.model';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(@Inject(AUTH_MODEL_PROVIDER) private readonly authModel: Model<Auth>) { }

  async create(authData: Partial<AuthUser>): Promise<AuthUser> {
    const newAuth = new this.authModel(authData);
    const savedAuth = await newAuth.save();
    return savedAuth.toObject() as AuthUser;
  }

  async findByEmail(email: string, withPassword?: boolean): Promise<AuthUser | null> {
    const emailHash = createBlindIndex(email);
    const query = this.authModel.findOne({ emailHash });
    if (withPassword) {
      query.select('+password');
    }
    const auth = await query.exec();
    return auth ? auth.toObject() as AuthUser : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const auth = await this.authModel.findOne({ id }).exec();
    return auth ? auth.toObject() as AuthUser : null;
  }

  async findByGoogleId(googleId: string): Promise<AuthUser | null> {
    const auth = await this.authModel.findOne({ googleId }).exec();
    return auth ? auth.toObject() as AuthUser : null;
  }

  async update(id: string, authData: Partial<AuthUser>): Promise<AuthUser> {
    const updatedAuth = await this.authModel.findOneAndUpdate(
      { id },
      { $set: authData },
      { new: true }
    ).exec();

    if (!updatedAuth) {
      throw new Error('Auth user not found');
    }

    return updatedAuth.toObject() as AuthUser;
  }

  async delete(id: string): Promise<void> {
    await this.authModel.findOneAndDelete({ id }).exec();
  }

  async removeRefreshToken(id: string): Promise<void> {
    await this.authModel.updateOne({ id }, { currentHashedRefreshToken: null }).exec();
  }
}
