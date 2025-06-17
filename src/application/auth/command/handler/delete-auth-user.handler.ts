import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteAuthUserCommand } from "../delete-auth-user.command";
import { AuthRepository } from "@infrastructure/repository/auth.repository";
import { Logger } from "@nestjs/common";

@CommandHandler(DeleteAuthUserCommand)
export class DeleteAuthUserHandler implements ICommandHandler<DeleteAuthUserCommand> {
    private readonly logger = new Logger(DeleteAuthUserHandler.name);

    constructor(private readonly authRepository: AuthRepository) {}

    async execute(command: DeleteAuthUserCommand): Promise<any> {
        this.logger.warn(`COMPENSATING: Deleting auth user ${command.userId}`);
        await this.authRepository.delete(command.userId);
    }
} 