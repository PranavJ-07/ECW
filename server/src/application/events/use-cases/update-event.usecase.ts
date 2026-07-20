import { EventInvalidStatusError, EventNotFoundError } from '../../../domain/errors/event.errors';
import { Event } from '../../../domain/entities/event.entity';
import { EventStatus } from '../../../domain/enums/event.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IEventRepository, UpdateEventData } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../services/event-authorization.service';
import { validateEventSchedule } from '../services/event-validation.service';

export interface UpdateEventInput {
  collegeId: string;
  eventSlug: string;
  data: UpdateEventData;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Updates an event. Blocked for cancelled events.
 * Cannot reduce capacity below current registrationCount.
 */
export class UpdateEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: UpdateEventInput): Promise<Event> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new EventInvalidStatusError('Cancelled events cannot be updated', 'EVENT_CANCELLED');
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    const startAt = input.data.startAt ?? event.startAt;
    const endAt = input.data.endAt ?? event.endAt;
    const location = input.data.location ?? event.location;
    const registrationClosesAt = input.data.registrationClosesAt ?? event.registrationClosesAt;

    validateEventSchedule({ startAt, endAt, registrationClosesAt, location });

    if (
      input.data.capacity !== undefined &&
      input.data.capacity < event.registrationCount
    ) {
      throw new EventInvalidStatusError(
        'Capacity cannot be less than current registration count',
        'CAPACITY_TOO_LOW',
      );
    }

    return this.eventRepository.update(input.collegeId, event.id, input.data);
  }
}
