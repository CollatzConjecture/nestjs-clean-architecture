import { IAuthRepository } from '@domain/interfaces/repositories/auth-repository.interface';
import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AuthUserCreatedEvent } from '@application/auth/events/auth-user-created.event';
import { CreateAuthUserCommand } from '@application/auth/command/create-auth-user.command';
import { LoggerService } from '@application/services/logger.service';
import { AuthDomainService } from '@domain/services/auth-domain.service';

@CommandHandler(CreateAuthUserCommand)
export class CreateAuthUserHandler implements ICommandHandler<CreateAuthUserCommand> {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
    private readonly authDomainService: AuthDomainService,
  ) {}

  async execute(command: CreateAuthUserCommand): Promise<void> {
    const { registerAuthDto, authId, profileId } = command;
    const { email, password, name, lastname, age } = registerAuthDto;
    const context = { module: 'CreateAuthUserHandler', method: 'execute' };

    this.logger.logger(`Starting user registration for email: ${email}`, context);

    this.authDomainService.validateUserCreation(registerAuthDto);
    
    const canCreate = await this.authDomainService.canCreateUser(email);
    if (!canCreate) {
      this.logger.warning(`Registration failed - email already exists: ${email}`, context);
      throw new ConflictException('An account with this email already exists.');
    }

    await this.authRepository.create({
      id: authId,
      email,
      password,
    });
    
    this.logger.logger(`Auth user created successfully with ID: ${authId}. Dispatching event.`, context);
    
    await this.eventBus.publish(new AuthUserCreatedEvent(authId, profileId, name, lastname, age));
  }
} 