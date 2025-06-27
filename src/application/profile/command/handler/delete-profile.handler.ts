import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteProfileCommand } from "../delete-profile.command";
import { ProfileRepository } from "@infrastructure/repository/profile.repository";
import { Logger } from "@nestjs/common";

@CommandHandler(DeleteProfileCommand)
export class DeleteProfileHandler implements ICommandHandler<DeleteProfileCommand> {
    private readonly logger = new Logger(DeleteProfileHandler.name);

    constructor(private readonly profileRepository: ProfileRepository) {}

    async execute(command: DeleteProfileCommand): Promise<void> {
        this.logger.warn(`Deleting profile ${command.profileId}`);
        await this.profileRepository.deleteById(command.profileId);
    }
} 