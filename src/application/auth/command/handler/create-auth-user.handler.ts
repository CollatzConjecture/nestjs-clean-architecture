import { UserAggregate } from '@domain/aggregates/user.aggregate';
import { AuthRepository } from '@infrastructure/repository/auth.repository';
import { ConflictException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AuthUserCreatedEvent } from '../../events/auth-user-created.event';
import { CreateAuthUserCommand } from '../create-auth-user.command';
import { LoggerService } from '@domain/services/logger.service';

@CommandHandler(CreateAuthUserCommand)
export class CreateAuthUserHandler implements ICommandHandler<CreateAuthUserCommand> {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly publisher: EventPublisher,
    private readonly logger: LoggerService,
  ) {}

  async execute(command: CreateAuthUserCommand): Promise<void> {
    const { registerAuthDto, authId, profileId } = command;
    const { email, password, name, lastname, age } = registerAuthDto;
    const context = { module: 'CreateAuthUserHandler', method: 'execute' };

    this.logger.logger(`Starting user registration for email: ${email}`, context);

    const existingAuth = await this.authRepository.findByEmail(email);
    if (existingAuth) {
      this.logger.warning(`Registration failed - email already exists: ${email}`, context);
      throw new ConflictException('An account with this email already exists.');
    }

    const user = this.publisher.mergeObjectContext(
      new UserAggregate()
    );

    await this.authRepository.create({
      id: authId,
      email,
      password,
    });
    
    this.logger.logger(`Auth user created successfully with ID: ${authId}. Dispatching AuthUserCreatedEvent.`, context);
    user.apply(new AuthUserCreatedEvent(authId, profileId, name, lastname, age));
    user.commit();
  }
} 