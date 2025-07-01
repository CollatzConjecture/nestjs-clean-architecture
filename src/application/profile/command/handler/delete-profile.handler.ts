import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteProfileCommand } from "../delete-profile.command";
import { ProfileRepository } from "@infrastructure/repository/profile.repository";
import { LoggerService } from "@domain/services/logger.service";

@CommandHandler(DeleteProfileCommand)
export class DeleteProfileHandler implements ICommandHandler<DeleteProfileCommand> {
    constructor(
        private readonly profileRepository: ProfileRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute(command: DeleteProfileCommand): Promise<void> {
        const context = { module: 'DeleteProfileHandler', method: 'execute' };
        
        this.logger.warning(`Deleting profile ${command.profileId}`, context);
        await this.profileRepository.deleteById(command.profileId);
        this.logger.logger(`Profile ${command.profileId} deleted successfully`, context);
    }
} 