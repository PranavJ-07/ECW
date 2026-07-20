import { EventNotFoundError } from '../../../domain/errors/event.errors';
import {
  RegistrationNotFoundError,
  CheckInClosedError,
} from '../../../domain/errors/registration.errors';
import { QrGenerationNotAvailableError } from '../../../domain/errors/attendance.errors';
import { AttendanceQrTokenResponse } from '../../../domain/entities/attendance-qr-token.entity';
import { RegistrationApprovalStatus, RegistrationStatus } from '../../../domain/enums/registration.enum';
import { EventStatus } from '../../../domain/enums/event.enum';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { IRegistrationRepository } from '../../../domain/interfaces/registration.repository.interface';
import { QrTokenService } from '../services/qr-token.service';
import { CheckInWindowService } from '../services/check-in-window.service';

export interface GenerateAttendanceQrInput {
  collegeId: string;
  eventSlug: string;
  userId: string;
}

/**
 * Issues a short-lived signed QR token for a registered attendee.
 * The mobile client renders the token string as a QR code.
 */
export class GenerateAttendanceQrUseCase {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository,
    private readonly qrTokenService: QrTokenService,
    private readonly checkInWindowService: CheckInWindowService,
  ) {}

  async execute(input: GenerateAttendanceQrInput): Promise<AttendanceQrTokenResponse> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new QrGenerationNotAvailableError('Event is not active for check-in');
    }

    try {
      this.checkInWindowService.assertWithinWindow(event.startAt, event.endAt);
    } catch (error) {
      if (error instanceof CheckInClosedError) {
        throw new QrGenerationNotAvailableError();
      }
      throw error;
    }

    const registration = await this.registrationRepository.findByEventAndUser(event.id, input.userId);

    if (!registration || registration.collegeId !== input.collegeId) {
      throw new RegistrationNotFoundError();
    }

    if (registration.status !== RegistrationStatus.REGISTERED) {
      throw new RegistrationNotFoundError('You must be registered to generate a check-in QR code');
    }

    if (
      registration.approvalStatus === RegistrationApprovalStatus.PENDING ||
      registration.approvalStatus === RegistrationApprovalStatus.REJECTED
    ) {
      throw new QrGenerationNotAvailableError('Registration approval is required before check-in');
    }

    return this.qrTokenService.sign({
      collegeId: input.collegeId,
      eventId: event.id,
      registrationId: registration.id,
      userId: input.userId,
    });
  }
}
