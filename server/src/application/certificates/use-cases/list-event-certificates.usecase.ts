import { EventNotFoundError } from '../../../domain/errors/event.errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { CertificateStatus } from '../../../domain/enums/certificate.enum';
import {
  ICertificateRepository,
  PaginatedCertificates,
} from '../../../domain/interfaces/certificate.repository.interface';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../../events/services/event-authorization.service';

export interface ListEventCertificatesInput {
  collegeId: string;
  eventSlug: string;
  status?: CertificateStatus;
  page?: number;
  limit?: number;
  actorId: string;
  actorRoles: UserRole[];
}

/**
 * Lists certificates issued for an event. Officers and college admins only.
 */
export class ListEventCertificatesUseCase {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: ListEventCertificatesInput): Promise<PaginatedCertificates> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 50, 100);

    return this.certificateRepository.listByEvent({
      collegeId: input.collegeId,
      eventId: event.id,
      status: input.status,
      page,
      limit,
    });
  }
}
