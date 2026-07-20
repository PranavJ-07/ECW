import { EventInvalidStatusError, EventNotFoundError } from '../../../domain/errors/event.errors';
import { Event } from '../../../domain/entities/event.entity';
import { EventStatus } from '../../../domain/enums/event.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../services/event-authorization.service';

export interface CancelEventInput {
  collegeId: string;
  eventSlug: string;
  reason?: string;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Cancels a published event. Notifies registrants (notification module — later).
 */
export class CancelEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: CancelEventInput): Promise<Event> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new EventInvalidStatusError('Only published events can be cancelled', 'EVENT_NOT_PUBLISHED');
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    return this.eventRepository.cancel(input.collegeId, event.id, input.reason?.trim());
  }
}
