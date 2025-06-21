import { RegisterAuthDto } from "@application/dto/auth/register-auth.dto";

export class CreateAuthUserCommand {
  constructor(
    public readonly registerAuthDto: RegisterAuthDto,
    public readonly authId: string,
    public readonly profileId: string,
  ) {}
} 