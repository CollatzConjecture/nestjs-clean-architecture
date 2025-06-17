export class ProfileCreationFailedEvent {
    constructor(
        public readonly userId: string,
        public readonly error: Error,
    ) {}
} 