import { Event } from '../../../domain/entities/event.entity';
import { EventStatus, EventVisibility } from '../../../domain/enums/event.enum';
import {
  EmailNotVerifiedRegistrationError,
  EventCancelledRegistrationError,
  RegistrationClosedError,
} from '../../../domain/errors/registration.errors';
import { EventMembersOnlyError } from '../../../domain/errors/event.errors';

/**
 * Validates whether a user can register for an event (eligibility rules).
 */
export class RegistrationEligibilityService {
  assertCanRegister(
    event: Event,
    options: {
      emailVerified: boolean;
      isMember: boolean;
      now?: Date;
    },
  ): void {
    if (!options.emailVerified) {
      throw new EmailNotVerifiedRegistrationError();
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new EventCancelledRegistrationError();
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new RegistrationClosedError('Event is not open for registration');
    }

    const now = options.now ?? new Date();

    if (event.registrationOpensAt && now < event.registrationOpensAt) {
      throw new RegistrationClosedError('Registration has not opened yet');
    }

    if (event.registrationClosesAt && now > event.registrationClosesAt) {
      throw new RegistrationClosedError('Registration deadline has passed');
    }

    if (event.visibility === EventVisibility.MEMBERS_ONLY && !options.isMember) {
      throw new EventMembersOnlyError();
    }
  }
}

export const registrationEligibilityService = new RegistrationEligibilityService();
