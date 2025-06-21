import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { CreateProfileCommand } from '../create-profile.command';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';
import { Logger } from '@nestjs/common';
import { ProfileCreationFailedEvent } from '../../events/profile-creation-failed.event';
import { UserAggregate } from '@domain/aggregates/user.aggregate';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
    private readonly logger = new Logger(CreateProfileHandler.name);

    constructor(
        private readonly profileRepository: ProfileRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: CreateProfileCommand): Promise<void> {
        this.logger.log(`Handling CreateProfileCommand for user ${command.authId}`);
        const { authId, profileId, name, lastname, age } = command;

        const user = this.publisher.mergeObjectContext(
            new UserAggregate()
        );

        try {
            // This is where you can add a check to simulate failure for testing the saga
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

            this.logger.log(`Profile for user ${profileId} created successfully.`);
            // Optionally, you could publish a ProfileCreatedSuccessEvent here
            
        } catch (error) {
            this.logger.error(`Failed to create profile for user ${profileId}`, error.stack);
            user.apply(new ProfileCreationFailedEvent(profileId, error));
        } finally {
            user.commit();
        }
    }
} 