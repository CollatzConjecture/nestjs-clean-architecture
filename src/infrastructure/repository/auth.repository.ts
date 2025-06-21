import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Auth } from '@infrastructure/models/auth.model';
import { AUTH_MODEL_PROVIDER } from '@constants';

@Injectable()
export class AuthRepository {
  constructor(@Inject(AUTH_MODEL_PROVIDER) private readonly authModel: Model<Auth>) {}

  async create(authData: Partial<Auth>): Promise<Auth> {
    const newAuth = new this.authModel(authData);
    return await newAuth.save();
  }

  async findByEmail(email: string, withPassword?: boolean): Promise<Auth> {
    const query = this.authModel.findOne({ email });
    if (withPassword) {
      query.select('+password');
    }
    const auth = await query.exec();
    return auth ? auth.toObject() : null;
  }

  async delete(id: string): Promise<void> {
    await this.authModel.findByIdAndDelete(id).exec();
  }

  async findByAuthId(authId: string): Promise<Auth> {
    const query = this.authModel.findOne({ id: authId });
    return await query.exec();
  }
}
