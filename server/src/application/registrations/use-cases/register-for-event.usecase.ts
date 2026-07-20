import { AlreadyRegisteredError } from '../../../domain/errors/registration.errors';
import { EventNotFoundError } from '../../../domain/errors/event.errors';
import { Registration } from '../../../domain/entities/registration.entity';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../../../domain/enums/registration.enum';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';
import { IRegistrationRepository } from '../../../domain/interfaces/registration.repository.interface';
import { registrationEligibilityService } from '../services/registration-eligibility.service';

export interface RegisterForEventInput {
  collegeId: string;
  eventSlug: string;
  userId: string;
  emailVerified: boolean;
  idempotencyKey?: string;
}

/**
 * Registers the current user for an event.
 * Handles capacity limits, waitlist, and idempotency.
 */
export class RegisterForEventUseCase {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(input: RegisterForEventInput): Promise<Registration> {
    if (input.idempotencyKey) {
      const existing = await this.registrationRepository.findByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    const existingRegistration = await this.registrationRepository.findByEventAndUser(
      event.id,
      input.userId,
    );

    if (
      existingRegistration &&
      [RegistrationStatus.REGISTERED, RegistrationStatus.WAITLISTED].includes(
        existingRegistration.status,
      )
    ) {
      throw new AlreadyRegisteredError();
    }

    const isMember = await this.membershipRepository.hasActiveMembership(event.clubId, input.userId);

    registrationEligibilityService.assertCanRegister(event, {
      emailVerified: input.emailVerified,
      isMember,
    });

    let status: RegistrationStatus;
    let approvalStatus = RegistrationApprovalStatus.NOT_REQUIRED;

    if (event.requiresApproval) {
      status = RegistrationStatus.REGISTERED;
      approvalStatus = RegistrationApprovalStatus.PENDING;
    } else if (event.capacity == null) {
      status = RegistrationStatus.REGISTERED;
      await this.eventRepository.reserveRegistrationSlot(input.collegeId, event.id);
    } else {
      const slot = await this.eventRepository.reserveRegistrationSlot(input.collegeId, event.id);
      status =
        slot === 'registered' ? RegistrationStatus.REGISTERED : RegistrationStatus.WAITLISTED;
    }

    return this.registrationRepository.create({
      collegeId: input.collegeId,
      eventId: event.id,
      clubId: event.clubId,
      userId: input.userId,
      status,
      approvalStatus,
      source: RegistrationSource.SELF,
      idempotencyKey: input.idempotencyKey,
    });
  }
}
