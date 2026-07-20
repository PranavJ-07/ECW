import { EventInvalidStatusError, EventNotFoundError } from '../../../domain/errors/event.errors';
import { Event } from '../../../domain/entities/event.entity';
import { EventStatus } from '../../../domain/enums/event.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../services/event-authorization.service';
import { validateEventSchedule } from '../services/event-validation.service';

export interface PublishEventInput {
  collegeId: string;
  eventSlug: string;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Transitions event from draft → published after validating required fields.
 */
export class PublishEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: PublishEventInput): Promise<Event> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    if (event.status !== EventStatus.DRAFT) {
      throw new EventInvalidStatusError('Only draft events can be published', 'EVENT_NOT_DRAFT');
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    validateEventSchedule({
      startAt: event.startAt,
      endAt: event.endAt,
      registrationClosesAt: event.registrationClosesAt,
      location: event.location,
    });

    return this.eventRepository.publish(input.collegeId, event.id);
  }
}
