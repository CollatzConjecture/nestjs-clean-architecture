import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { CreateProfileCommand } from '@application/profile/command/create-profile.command';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { ProfileCreationFailedEvent } from '@application/profile/events/profile-creation-failed.event';
import { UserAggregate } from '@domain/aggregates/user.aggregate';
import { LoggerService } from '@domain/services/logger.service';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
    constructor(
        private readonly profileRepository: ProfileRepository,
        private readonly publisher: EventPublisher,
        private readonly logger: LoggerService,
    ) {}

    async execute(command: CreateProfileCommand): Promise<void> {
        const { authId, profileId, name, lastname, age } = command;
        const context = { module: 'CreateProfileHandler', method: 'execute' };

        this.logger.logger(`Creating profile ${profileId} for auth user ${authId}`, context);

        const user = this.publisher.mergeObjectContext(
            new UserAggregate()
        );

        try {
            if (name.toLowerCase() === 'fail') {
                throw new Error('Simulated profile creation failure.');
            }
    
            await this.profileRepository.create({
                id: profileId,
                authId,
                name,
                lastname,
                age
            });

            this.logger.logger(`Profile ${profileId} created successfully for user ${authId}`, context);
            
        } catch (error) {
            this.logger.err(`Failed to create profile ${profileId} for user ${authId}: ${error.message}`, context);
            user.apply(new ProfileCreationFailedEvent(authId, profileId, error));
        } finally {
            user.commit();
        }
    }
} 