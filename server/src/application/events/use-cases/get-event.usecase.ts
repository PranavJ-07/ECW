import { EventMembersOnlyError, EventNotFoundError } from '../../../domain/errors/event.errors';
import { Event, EventClubContext } from '../../../domain/entities/event.entity';
import { EventVisibility } from '../../../domain/enums/event.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../services/event-authorization.service';

export interface GetEventInput {
  collegeId: string;
  eventSlug: string;
  userId?: string;
  actorRoles?: UserRole[];
}

export interface GetEventOutput extends Event {
  club: EventClubContext;
}

/**
 * Returns event details with club context.
 * Enforces members_only visibility for non-members.
 */
export class GetEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly clubRepository: IClubRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: GetEventInput): Promise<GetEventOutput> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    const club = await this.clubRepository.findById(input.collegeId, event.clubId);

    if (!club) {
      throw new EventNotFoundError();
    }

    if (event.visibility === EventVisibility.MEMBERS_ONLY && input.userId) {
      const canView = await this.eventAuthService.canViewMembersOnlyEvent(
        event.clubId,
        input.userId,
        input.actorRoles ?? [],
      );

      if (!canView) {
        throw new EventMembersOnlyError();
      }
    }

    return {
      ...event,
      club: { id: club.id, name: club.name, slug: club.slug },
    };
  }
}
