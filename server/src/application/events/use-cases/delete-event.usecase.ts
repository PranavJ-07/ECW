import { EventNotDraftError, EventNotFoundError } from '../../../domain/errors/event.errors';
import { EventStatus } from '../../../domain/enums/event.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../services/event-authorization.service';

export interface DeleteEventInput {
  collegeId: string;
  eventSlug: string;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Permanently soft-deletes a draft event.
 */
export class DeleteEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: DeleteEventInput): Promise<void> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    if (event.status !== EventStatus.DRAFT) {
      throw new EventNotDraftError();
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    await this.eventRepository.softDelete(input.collegeId, event.id);
  }
}
