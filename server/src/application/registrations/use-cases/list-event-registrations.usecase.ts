import { EventNotFoundError } from '../../../domain/errors/event.errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { RegistrationStatus } from '../../../domain/enums/registration.enum';
import {
  IRegistrationRepository,
  PaginatedRegistrations,
} from '../../../domain/interfaces/registration.repository.interface';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../../events/services/event-authorization.service';

export interface ListEventRegistrationsInput {
  collegeId: string;
  eventSlug: string;
  status?: RegistrationStatus;
  search?: string;
  page?: number;
  limit?: number;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Lists registrations for an event. Officers and college admins only.
 */
export class ListEventRegistrationsUseCase {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: ListEventRegistrationsInput): Promise<PaginatedRegistrations> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 50, 100);

    return this.registrationRepository.listByEvent({
      collegeId: input.collegeId,
      eventId: event.id,
      status: input.status,
      search: input.search,
      page,
      limit,
    });
  }
}
