import { DeleteAuthUserCommand } from '@application/auth/command/delete-auth-user.command';
import { AuthUserDeletedEvent } from '@application/auth/events/auth-user-deleted.event';
import { IAuthRepository } from '@domain/interfaces/repositories/auth-repository.interface';
import { IProfileRepository } from '@domain/interfaces/repositories/profile-repository.interface';
import { LoggerService } from '@application/services/logger.service';
import { AuthDomainService } from '@domain/services/auth-domain.service';
import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(DeleteAuthUserCommand)
export class DeleteAuthUserHandler
  implements ICommandHandler<DeleteAuthUserCommand>
{
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
    private readonly authDomainService: AuthDomainService,
  ) {}

  async execute(command: DeleteAuthUserCommand): Promise<void> {
    const { authId, profileId } = command;
    const context = { module: 'DeleteAuthUserHandler', method: 'execute' };

    this.logger.warning(
      `COMPENSATING ACTION: Deleting auth user ${authId} and associated profile ${profileId}`,
      context,
    );

    const user = await this.authRepository.findById(authId);
    const userExists = this.authDomainService.userExistsForDeletion(user);
    if (!userExists) {
      this.logger.warning(
        `Auth user ${authId} not found for deletion`,
        context,
      );
      return;
    }

    await this.profileRepository.delete(profileId);
    await this.authRepository.delete(authId);

    this.logger.logger(
      `Auth user ${authId} and profile ${profileId} deleted successfully. Dispatching event.`,
      context,
    );

    await this.eventBus.publish(new AuthUserDeletedEvent(authId, profileId));
  }
}
