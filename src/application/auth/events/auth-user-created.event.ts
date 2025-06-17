export class AuthUserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly lastname: string,
    public readonly age: number,
  ) {}
} 