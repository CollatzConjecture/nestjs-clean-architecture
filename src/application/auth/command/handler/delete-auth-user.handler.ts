import { DeleteAuthUserCommand } from "@application/auth/command/delete-auth-user.command";
import { AuthUserDeletedEvent } from "@application/auth/events/auth-user-deleted.event";
import { UserAggregate } from "@domain/aggregates/user.aggregate";
import { AuthRepository } from "@infrastructure/repository/auth.repository";
import { Logger } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(DeleteAuthUserCommand)
export class DeleteAuthUserHandler implements ICommandHandler<DeleteAuthUserCommand> {
    private readonly logger = new Logger(DeleteAuthUserHandler.name);

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: DeleteAuthUserCommand): Promise<void> {
        const { authId, profileId } = command;
        this.logger.warn(`COMPENSATING: Deleting auth user ${authId}`);
        await this.authRepository.deleteById(authId);

        const user = this.publisher.mergeObjectContext(
            new UserAggregate()
        );

        user.apply(new AuthUserDeletedEvent(authId, profileId));
        user.commit();
    }
} 