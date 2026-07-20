import { ForbiddenError } from '../../../domain/errors';
import { RegistrationNotFoundError } from '../../../domain/errors/registration.errors';
import { EventNotFoundError } from '../../../domain/errors/event.errors';
import { Registration } from '../../../domain/entities/registration.entity';
import { RegistrationStatus } from '../../../domain/enums/registration.enum';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { IRegistrationRepository } from '../../../domain/interfaces/registration.repository.interface';

export interface CancelRegistrationInput {
  collegeId: string;
  eventSlug: string;
  userId: string;
}

/**
 * Cancels the user's own registration and promotes waitlist if applicable.
 */
export class CancelRegistrationUseCase {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(input: CancelRegistrationInput): Promise<Registration> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    const registration = await this.registrationRepository.findByEventAndUser(event.id, input.userId);

    if (!registration || registration.collegeId !== input.collegeId) {
      throw new RegistrationNotFoundError();
    }

    if (registration.userId !== input.userId) {
      throw new ForbiddenError('You can only cancel your own registration', 'FORBIDDEN');
    }

    if (
      ![RegistrationStatus.REGISTERED, RegistrationStatus.WAITLISTED].includes(registration.status)
    ) {
      throw new RegistrationNotFoundError('No active registration found');
    }

    const wasRegistered = registration.status === RegistrationStatus.REGISTERED;

    const updated = await this.registrationRepository.updateStatus(input.collegeId, registration.id, {
      status: RegistrationStatus.CANCELLED,
      cancelledAt: new Date(),
    });

    if (!event.requiresApproval) {
      await this.eventRepository.releaseRegistrationSlot(input.collegeId, event.id, wasRegistered);

      if (wasRegistered) {
        await this.promoteWaitlist(input.collegeId, event.id);
      }
    }

    return updated;
  }

  private async promoteWaitlist(collegeId: string, eventId: string): Promise<void> {
    const next = await this.registrationRepository.findOldestWaitlisted(eventId);

    if (!next) {
      return;
    }

    await this.registrationRepository.updateStatus(collegeId, next.id, {
      status: RegistrationStatus.REGISTERED,
    });

    await this.eventRepository.promoteWaitlistSlot(collegeId, eventId);
  }
}
