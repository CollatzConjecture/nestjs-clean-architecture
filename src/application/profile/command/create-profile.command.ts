export class CreateProfileCommand {
    constructor(
        public readonly profileId: string,
        public readonly authId: string,
        public readonly name: string,
        public readonly lastname: string,
        public readonly age: number,
    ) {}
} 