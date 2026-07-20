import { EventNotFoundError } from '../../../domain/errors/event.errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import {
  IAttendanceCheckInRepository,
  PaginatedAttendanceCheckIns,
} from '../../../domain/interfaces/attendance-checkin.repository.interface';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../../events/services/event-authorization.service';

export interface ListAttendanceCheckInsInput {
  collegeId: string;
  eventSlug: string;
  page?: number;
  limit?: number;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Lists QR/manual attendance audit records for an event. Officers and college admins only.
 */
export class ListAttendanceCheckInsUseCase {
  constructor(
    private readonly attendanceCheckInRepository: IAttendanceCheckInRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: ListAttendanceCheckInsInput): Promise<PaginatedAttendanceCheckIns> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 50, 100);

    return this.attendanceCheckInRepository.listByEvent({
      collegeId: input.collegeId,
      eventId: event.id,
      page,
      limit,
    });
  }
}
