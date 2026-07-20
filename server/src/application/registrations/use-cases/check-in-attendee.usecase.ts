import { RegistrationNotFoundError, AlreadyCheckedInError, CheckInClosedError } from '../../../domain/errors/registration.errors';
import { EventNotFoundError } from '../../../domain/errors/event.errors';
import { Registration } from '../../../domain/entities/registration.entity';
import { RegistrationStatus } from '../../../domain/enums/registration.enum';
import { EventStatus } from '../../../domain/enums/event.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { IRegistrationRepository } from '../../../domain/interfaces/registration.repository.interface';
import { EventAuthorizationService } from '../../events/services/event-authorization.service';
import { CheckInWindowService } from '../../attendance/services/check-in-window.service';

export interface CheckInAttendeeInput {
  collegeId: string;
  eventSlug: string;
  registrationId?: string;
  userId?: string;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Marks an attendee as checked in. Officers and college admins only.
 */
export class CheckInAttendeeUseCase {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
    private readonly checkInWindowService: CheckInWindowService = new CheckInWindowService(),
  ) {}

  async execute(input: CheckInAttendeeInput): Promise<Registration> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new CheckInClosedError('Event is not active for check-in');
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    this.checkInWindowService.assertWithinWindow(event.startAt, event.endAt);

    let registration: Registration | null = null;

    if (input.registrationId) {
      registration = await this.registrationRepository.findById(input.collegeId, input.registrationId);
    } else if (input.userId) {
      registration = await this.registrationRepository.findByEventAndUser(event.id, input.userId);
    }

    if (!registration || registration.eventId !== event.id) {
      throw new RegistrationNotFoundError();
    }

    if (registration.status === RegistrationStatus.ATTENDED) {
      throw new AlreadyCheckedInError();
    }

    if (registration.status !== RegistrationStatus.REGISTERED) {
      throw new RegistrationNotFoundError('User is not registered for this event');
    }

    return this.registrationRepository.updateStatus(input.collegeId, registration.id, {
      status: RegistrationStatus.ATTENDED,
      checkedInAt: new Date(),
      checkedInBy: input.actorId,
    });
  }
}
