export class AuthUserDeletedEvent {
  constructor(
    public readonly authId: string,
    public readonly profileId: string,
  ) {}
} 