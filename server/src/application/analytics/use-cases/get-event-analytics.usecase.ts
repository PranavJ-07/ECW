import { EventNotFoundError } from '../../../domain/errors/event.errors';
import { EventAnalytics } from '../../../domain/entities/analytics.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IAnalyticsRepository } from '../../../domain/interfaces/analytics.repository.interface';
import { IEventRepository } from '../../../domain/interfaces/event.repository.interface';
import { EventAuthorizationService } from '../../events/services/event-authorization.service';

export interface GetEventAnalyticsInput {
  collegeId: string;
  eventSlug: string;
  actorId: string;
  actorRoles: UserRole[];
}

export class GetEventAnalyticsUseCase {
  constructor(
    private readonly analyticsRepository: IAnalyticsRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventAuthService: EventAuthorizationService,
  ) {}

  async execute(input: GetEventAnalyticsInput): Promise<EventAnalytics> {
    const event = await this.eventRepository.findBySlug(input.collegeId, input.eventSlug);

    if (!event || event.isDeleted) {
      throw new EventNotFoundError();
    }

    await this.eventAuthService.assertCanManage(event.clubId, input.actorId, input.actorRoles);

    return this.analyticsRepository.getEventAnalytics(input.collegeId, event.id);
  }
}
