export class ProfileCreationFailedEvent {
    constructor(
        public readonly authId: string,
        public readonly profileId: string,
        public readonly error: Error,
    ) {}
} 