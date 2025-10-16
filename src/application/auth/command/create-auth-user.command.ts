import { RegisterAuthDto } from '@api/dto/auth/register-auth.dto';

export class CreateAuthUserCommand {
  constructor(
    public readonly registerAuthDto: RegisterAuthDto,
    public readonly authId: string,
    public readonly profileId: string,
  ) {}
} 