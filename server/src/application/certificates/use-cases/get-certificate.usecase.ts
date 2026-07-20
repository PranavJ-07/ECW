import { ForbiddenError } from '../../../domain/errors';
import { CertificateNotFoundError, CertificateRevokedError } from '../../../domain/errors/certificate.errors';
import { Certificate } from '../../../domain/entities/certificate.entity';
import { CertificateStatus } from '../../../domain/enums/certificate.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ICertificateRepository } from '../../../domain/interfaces/certificate.repository.interface';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../../events/services/event-authorization.service';

export interface GetCertificateInput {
  collegeId: string;
  certificateId: string;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Fetches a certificate by ID for the owner or event managers.
 */
export class GetCertificateUseCase {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: GetCertificateInput): Promise<Certificate> {
    const certificate = await this.certificateRepository.findById(
      input.collegeId,
      input.certificateId,
    );

    if (!certificate) {
      throw new CertificateNotFoundError();
    }

    if (certificate.userId === input.actorId) {
      return certificate;
    }

    const event = await this.eventRepository.findById(input.collegeId, certificate.eventId);

    if (!event) {
      throw new CertificateNotFoundError();
    }

    try {
      await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);
      return certificate;
    } catch {
      throw new ForbiddenError('You can only view your own certificates', 'FORBIDDEN');
    }
  }
}

export interface GetMyCertificateInput {
  collegeId: string;
  certificateId: string;
  userId: string;
}

/**
 * Fetches the authenticated user's own certificate.
 */
export class GetMyCertificateUseCase {
  constructor(private readonly certificateRepository: ICertificateRepository) {}

  async execute(input: GetMyCertificateInput): Promise<Certificate> {
    const certificate = await this.certificateRepository.findById(
      input.collegeId,
      input.certificateId,
    );

    if (!certificate || certificate.userId !== input.userId) {
      throw new CertificateNotFoundError();
    }

    if (certificate.status === CertificateStatus.REVOKED) {
      throw new CertificateRevokedError();
    }

    return certificate;
  }
}
