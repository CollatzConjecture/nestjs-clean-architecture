import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Auth, createBlindIndex } from '@infrastructure/models/auth.model';
import { AUTH_MODEL_PROVIDER } from '@constants';

@Injectable()
export class AuthRepository {
  constructor(@Inject(AUTH_MODEL_PROVIDER) private readonly authModel: Model<Auth>) {}

  async create(authData: Partial<Auth>): Promise<Auth> {
    const newAuth = new this.authModel(authData);
    return await newAuth.save();
  }

  async findByEmail(email: string, withPassword?: boolean): Promise<Auth> {
    const emailHash = createBlindIndex(email);
    const query = this.authModel.findOne({ emailHash });
    if (withPassword) {
      query.select('+password');
    }
    const auth = await query.exec();
    return auth;
  }

  async deleteById(id: string): Promise<void> {
    await this.authModel.findOneAndDelete({ id }).exec();
  }

  async findById(id: string): Promise<Auth> {
    const query = this.authModel.findOne({ id });
    return await query.exec();
  }

  async findByGoogleId(googleId: string): Promise<Auth> {
    const query = this.authModel.findOne({ googleId });
    return await query.exec();
  }

  async removeRefreshToken(id: string): Promise<void> {
    await this.authModel.updateOne({ id }, { currentHashedRefreshToken: null }).exec();
  }
}
