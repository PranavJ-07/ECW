import { Event } from '../../../domain/entities/event.entity';
import { EventStatus } from '../../../domain/enums/event.enum';
import { CertificateEventNotEligibleError } from '../../../domain/errors/certificate.errors';

/**
 * Validates whether certificates can be issued for an event.
 */
export class CertificateEligibilityService {
  assertEventEligible(event: Event): void {
    if (event.isDeleted) {
      throw new CertificateEventNotEligibleError('Event not found');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new CertificateEventNotEligibleError('Cannot issue certificates for a cancelled event');
    }

    if (event.status === EventStatus.DRAFT) {
      throw new CertificateEventNotEligibleError('Publish the event before issuing certificates');
    }
  }
}

export const certificateEligibilityService = new CertificateEligibilityService();
