import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { DeleteProfileCommand } from "@application/profile/command/delete-profile.command";
import { IProfileRepository } from "@domain/interfaces/repositories/profile-repository.interface";
import { LoggerService } from "@domain/services/logger.service";

@CommandHandler(DeleteProfileCommand)
export class DeleteProfileHandler implements ICommandHandler<DeleteProfileCommand> {
    constructor(
        @Inject('IProfileRepository')
        private readonly profileRepository: IProfileRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute(command: DeleteProfileCommand): Promise<void> {
        const context = { module: 'DeleteProfileHandler', method: 'execute' };
        
        this.logger.warning(`Deleting profile ${command.profileId}`, context);
        await this.profileRepository.delete(command.profileId);
        this.logger.logger(`Profile ${command.profileId} deleted successfully`, context);
    }
} 