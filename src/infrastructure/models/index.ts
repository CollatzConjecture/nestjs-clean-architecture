import { Connection } from 'mongoose';
import { PROFILE_MODEL_PROVIDER, DB_PROVIDER, AUTH_MODEL_PROVIDER } from '@constants';
import { ProfileSchema } from './profile.model';
import { AuthSchema } from './auth.model';

export const modelProviders = [
  {
    provide: PROFILE_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Profile', ProfileSchema),
    inject: [DB_PROVIDER],
  },
  {
    provide: AUTH_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Auth', AuthSchema),
    inject: [DB_PROVIDER],
  },
];
