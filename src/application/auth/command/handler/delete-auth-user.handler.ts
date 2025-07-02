import { DeleteAuthUserCommand } from "@application/auth/command/delete-auth-user.command";
import { AuthUserDeletedEvent } from "@application/auth/events/auth-user-deleted.event";
import { IAuthRepository } from "@domain/interfaces/repositories/auth-repository.interface";
import { LoggerService } from "@domain/services/logger.service";
import { AuthDomainService } from "@domain/services/auth-domain.service";
import { Inject } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(DeleteAuthUserCommand)
export class DeleteAuthUserHandler implements ICommandHandler<DeleteAuthUserCommand> {
    constructor(
        @Inject('IAuthRepository')
        private readonly authRepository: IAuthRepository,
        private readonly eventBus: EventBus,
        private readonly logger: LoggerService,
        private readonly authDomainService: AuthDomainService,
    ) {}

    async execute(command: DeleteAuthUserCommand): Promise<void> {
        const { authId, profileId } = command;
        const context = { module: 'DeleteAuthUserHandler', method: 'execute' };
        
        this.logger.warning(`COMPENSATING ACTION: Deleting auth user ${authId} due to profile creation failure`, context);
        
        const userExists = await this.authDomainService.userExistsForDeletion(authId);
        if (!userExists) {
            this.logger.warning(`Auth user ${authId} not found for deletion`, context);
            return;
        }

        await this.authRepository.delete(authId);

        this.logger.logger(`Auth user ${authId} deleted successfully. Dispatching event.`, context);
        
        await this.eventBus.publish(new AuthUserDeletedEvent(authId, profileId));
    }
} 