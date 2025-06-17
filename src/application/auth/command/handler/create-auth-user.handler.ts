import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { CreateAuthUserCommand } from '../create-auth-user.command';
import { AuthRepository } from '@infrastructure/repository/auth.repository';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { AuthUserCreatedEvent } from '../../events/auth-user-created.event';
import { UserAggregate } from '@domain/aggregates/user.aggregate';

@CommandHandler(CreateAuthUserCommand)
export class CreateAuthUserHandler implements ICommandHandler<CreateAuthUserCommand> {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateAuthUserCommand): Promise<void> {
    const { registerAuthDto, userId } = command;
    const { email, password, name, lastname, age } = registerAuthDto;

    const existingAuth = await this.authRepository.findByEmail(email);
    if (existingAuth) {
      throw new ConflictException('An account with this email already exists.');
    }

    const user = this.publisher.mergeObjectContext(
      new UserAggregate()
    );

    await this.authRepository.create({
      id: userId,
      email,
      password,
    });
    
    user.apply(new AuthUserCreatedEvent(userId, name, lastname, age));
    user.commit();
  }
} 