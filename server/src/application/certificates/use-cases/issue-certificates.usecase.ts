import { EventNotFoundError } from '../../../domain/errors/event.errors';
import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import {
  CertificateAlreadyIssuedError,
  NotEligibleForCertificateError,
} from '../../../domain/errors/certificate.errors';
import { Certificate } from '../../../domain/entities/certificate.entity';
import { Event } from '../../../domain/entities/event.entity';
import { CertificateStatus } from '../../../domain/enums/certificate.enum';
import { RegistrationStatus } from '../../../domain/enums/registration.enum';
import { ICertificateRepository } from '../../../domain/interfaces/certificate.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { IRegistrationRepository } from '../../../domain/interfaces/registration.repository.interface';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { EventAuthorizationService } from '../../events/services/event-authorization.service';
import { CertificateEligibilityService } from '../services/certificate-eligibility.service';
import { CertificateIdentityService } from '../services/certificate-identity.service';

export interface IssueCertificatesInput {
  collegeId: string;
  eventSlug: string;
  userIds?: string[];
  actorId: string;
  actorRoles: UserRole[];
}

export interface IssueCertificatesResult {
  issued: Certificate[];
  skipped: Array<{ userId: string; reason: string }>;
}

/**
 * Issues certificates to attended registrants for an event.
 * When userIds is omitted, issues to all attended users without an existing certificate.
 */
export class IssueCertificatesUseCase {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository,
    private readonly clubRepository: IClubRepository,
    private readonly userRepository: IUserRepository,
    private readonly eventAuthService: EventAuthorizationService,
    private readonly certificateEligibilityService: CertificateEligibilityService,
    private readonly certificateIdentityService: CertificateIdentityService,
  ) {}

  async execute(input: IssueCertificatesInput): Promise<IssueCertificatesResult> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event) {
      throw new EventNotFoundError();
    }

    this.certificateEligibilityService.assertEventEligible(event);
    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    const club = await this.clubRepository.findById(input.collegeId, event.clubId);

    if (!club) {
      throw new ClubNotFoundError();
    }

    const targetUserIds = await this.resolveTargetUserIds(input.collegeId, event.id, input.userIds);
    const issued: Certificate[] = [];
    const skipped: Array<{ userId: string; reason: string }> = [];

    for (const userId of targetUserIds) {
      try {
        const certificate = await this.issueToUser({
          collegeId: input.collegeId,
          event,
          clubName: club.name,
          userId,
          actorId: input.actorId,
        });
        issued.push(certificate);
      } catch (error) {
        skipped.push({
          userId,
          reason: error instanceof Error ? error.message : 'Unable to issue certificate',
        });
      }
    }

    return { issued, skipped };
  }

  private async resolveTargetUserIds(
    collegeId: string,
    eventId: string,
    userIds?: string[],
  ): Promise<string[]> {
    if (userIds?.length) {
      return userIds;
    }

    const attended: string[] = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const batch = await this.registrationRepository.listByEvent({
        collegeId,
        eventId,
        status: RegistrationStatus.ATTENDED,
        page,
        limit,
      });

      attended.push(...batch.registrations.map((r) => r.userId));

      if (page >= batch.totalPages) {
        break;
      }

      page += 1;
    }

    return attended;
  }

  private async issueToUser(input: {
    collegeId: string;
    event: Event;
    clubName: string;
    userId: string;
    actorId: string;
  }): Promise<Certificate> {
    const registration = await this.registrationRepository.findByEventAndUser(
      input.event.id,
      input.userId,
    );

    if (!registration || registration.collegeId !== input.collegeId) {
      throw new NotEligibleForCertificateError('User is not registered for this event');
    }

    if (registration.status !== RegistrationStatus.ATTENDED) {
      throw new NotEligibleForCertificateError();
    }

    const existing = await this.certificateRepository.findByEventAndUser(
      input.event.id,
      input.userId,
    );

    if (existing) {
      if (existing.status === CertificateStatus.REVOKED) {
        throw new CertificateAlreadyIssuedError(
          'A revoked certificate exists; revoke handling must be implemented separately',
        );
      }
      throw new CertificateAlreadyIssuedError();
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user || user.collegeId !== input.collegeId) {
      throw new NotEligibleForCertificateError('User not found in this college');
    }

    return this.certificateRepository.create({
      collegeId: input.collegeId,
      eventId: input.event.id,
      clubId: input.event.clubId,
      userId: input.userId,
      registrationId: registration.id,
      certificateNumber: this.certificateIdentityService.generateCertificateNumber(),
      verificationCode: this.certificateIdentityService.generateVerificationCode(),
      recipientName: `${user.firstName} ${user.lastName}`.trim(),
      eventTitle: input.event.title,
      eventDate: input.event.startAt,
      clubName: input.clubName,
      issuedBy: input.actorId,
    });
  }
}
