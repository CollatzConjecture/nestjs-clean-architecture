import { DeleteAuthUserCommand } from "@application/auth/command/delete-auth-user.command";
import { AuthUserDeletedEvent } from "@application/auth/events/auth-user-deleted.event";
import { UserAggregate } from "@domain/aggregates/user.aggregate";
import { AuthRepository } from "@infrastructure/repository/auth.repository";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { LoggerService } from "@domain/services/logger.service";

@CommandHandler(DeleteAuthUserCommand)
export class DeleteAuthUserHandler implements ICommandHandler<DeleteAuthUserCommand> {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly publisher: EventPublisher,
        private readonly logger: LoggerService,
    ) {}

    async execute(command: DeleteAuthUserCommand): Promise<void> {
        const { authId, profileId } = command;
        const context = { module: 'DeleteAuthUserHandler', method: 'execute' };
        
        this.logger.warning(`COMPENSATING ACTION: Deleting auth user ${authId} due to profile creation failure`, context);
        
        await this.authRepository.deleteById(authId);

        const user = this.publisher.mergeObjectContext(
            new UserAggregate()
        );

        this.logger.logger(`Auth user ${authId} deleted successfully. Dispatching AuthUserDeletedEvent.`, context);
        user.apply(new AuthUserDeletedEvent(authId, profileId));
        user.commit();
    }
} 