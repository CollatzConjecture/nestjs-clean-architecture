export class DeleteAuthUserCommand {
    constructor(
        public readonly authId: string,
        public readonly profileId: string,
    ) {}
} 