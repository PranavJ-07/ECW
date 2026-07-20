import { ClubArchivedError, ClubNotFoundError } from '../../../domain/errors/club.errors';
import { EventSlugExistsError } from '../../../domain/errors/event.errors';
import { Event } from '../../../domain/entities/event.entity';
import { ClubStatus } from '../../../domain/enums/club.enum';
import { EventVisibility } from '../../../domain/enums/event.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { CreateEventData, IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../services/event-authorization.service';
import { validateEventSchedule } from '../services/event-validation.service';

export interface CreateEventInput {
  collegeId: string;
  clubSlug: string;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  location: CreateEventData['location'];
  startAt: Date;
  endAt: Date;
  timezone: string;
  capacity?: number;
  registrationOpensAt?: Date;
  registrationClosesAt?: Date;
  requiresApproval?: boolean;
  visibility?: EventVisibility;
  tags?: string[];
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Creates a draft event for a club.
 * Authorization: college_admin OR active officer of the club.
 */
export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly clubRepository: IClubRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: CreateEventInput): Promise<Event> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    if (club.status === ClubStatus.ARCHIVED) {
      throw new ClubArchivedError();
    }

    await this.eventAuthService.assertCanManage(club.id, input.actorId, input.actorRoles);

    validateEventSchedule({
      startAt: input.startAt,
      endAt: input.endAt,
      registrationClosesAt: input.registrationClosesAt,
      location: input.location,
    });

    const normalizedSlug = input.slug.toLowerCase().trim();
    const slugTaken = await this.eventRepository.slugExists(input.collegeId, normalizedSlug);

    if (slugTaken) {
      throw new EventSlugExistsError();
    }

    return this.eventRepository.create({
      collegeId: input.collegeId,
      clubId: club.id,
      title: input.title.trim(),
      slug: normalizedSlug,
      description: input.description?.trim(),
      coverImageUrl: input.coverImageUrl,
      location: input.location,
      startAt: input.startAt,
      endAt: input.endAt,
      timezone: input.timezone,
      capacity: input.capacity,
      registrationOpensAt: input.registrationOpensAt,
      registrationClosesAt: input.registrationClosesAt,
      requiresApproval: input.requiresApproval ?? false,
      visibility: input.visibility ?? EventVisibility.COLLEGE_ONLY,
      tags: input.tags ?? [],
      createdBy: input.actorId,
    });
  }
}
