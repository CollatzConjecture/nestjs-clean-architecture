import { Injectable, Logger } from '@nestjs/common';
import { Saga, ofType, ICommand } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthUserCreatedEvent } from '../events/auth-user-created.event';
import { CreateProfileCommand } from '@application/profile/command/create-profile.command';
import { DeleteAuthUserCommand } from '../command/delete-auth-user.command';
import { ProfileCreationFailedEvent } from '@application/profile/events/profile-creation-failed.event';

@Injectable()
export class RegistrationSaga {
  private readonly logger = new Logger(RegistrationSaga.name);

  @Saga()
  userCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(AuthUserCreatedEvent),
      map((event) => {
        this.logger.log(
          `Saga continues: mapping AuthUserCreatedEvent to CreateProfileCommand 
            for user ${event.authId}`,
        );
        return new CreateProfileCommand(
          event.profileId,
          event.authId,
          event.name,
          event.lastname,
          event.age,
        );
      }),
    );
  };

  @Saga()
  profileCreationFailed = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ProfileCreationFailedEvent),
      map((event) => {
        this.logger.warn(
          `Saga compensates: mapping ProfileCreationFailedEvent to 
            DeleteAuthUserCommand for user ${event.authId}`,
        );
        return new DeleteAuthUserCommand(event.authId, event.profileId);
      }),
    );
  };
}
