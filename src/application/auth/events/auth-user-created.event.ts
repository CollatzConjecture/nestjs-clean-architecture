export class AuthUserCreatedEvent {
  constructor(
    public readonly authId: string,
    public readonly profileId: string,
    public readonly name: string,
    public readonly lastname: string,
    public readonly age: number,
  ) {}
} 