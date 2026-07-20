import { EventLocation } from '../../../domain/entities/event.entity';
import { EventLocationMode } from '../../../domain/enums/event.enum';
import { EventValidationError } from '../../../domain/errors/event.errors';

export function validateEventSchedule(input: {
  startAt: Date;
  endAt: Date;
  registrationClosesAt?: Date;
  location: EventLocation;
}): void {
  if (input.endAt <= input.startAt) {
    throw new EventValidationError('endAt must be after startAt');
  }

  if (input.registrationClosesAt && input.registrationClosesAt > input.startAt) {
    throw new EventValidationError('registrationClosesAt must be before or equal to startAt');
  }

  if (
    (input.location.mode === EventLocationMode.ONLINE ||
      input.location.mode === EventLocationMode.HYBRID) &&
    !input.location.meetingUrl
  ) {
    throw new EventValidationError('meetingUrl is required for online or hybrid events');
  }

  if (
    (input.location.mode === EventLocationMode.ONSITE ||
      input.location.mode === EventLocationMode.HYBRID) &&
    !input.location.venueName
  ) {
    throw new EventValidationError('venueName is required for onsite or hybrid events');
  }
}
