import { EventNotFoundError } from '../../../domain/errors/event.errors';
import { CertificateNotFoundError, CertificateRevokedError } from '../../../domain/errors/certificate.errors';
import { Certificate } from '../../../domain/entities/certificate.entity';
import { CertificateStatus } from '../../../domain/enums/certificate.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ICertificateRepository } from '../../../domain/interfaces/certificate.repository.interface';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../../events/services/event-authorization.service';

export interface RevokeCertificateInput {
  collegeId: string;
  eventSlug: string;
  certificateId: string;
  actorId: string;
  actorRoles: UserRole[];
  reason?: string;
}

/**
 * Revokes a certificate. Officers and college admins only.
 */
export class RevokeCertificateUseCase {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: RevokeCertificateInput): Promise<Certificate> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    const certificate = await this.certificateRepository.findById(
      input.collegeId,
      input.certificateId,
    );

    if (!certificate || certificate.eventId !== event.id) {
      throw new CertificateNotFoundError();
    }

    if (certificate.status === CertificateStatus.REVOKED) {
      throw new CertificateRevokedError('Certificate is already revoked');
    }

    return this.certificateRepository.revoke(input.collegeId, certificate.id, {
      revokedBy: input.actorId,
      revokeReason: input.reason,
    });
  }
}
