import { GetCollegeOverviewUseCase } from '../../../application/analytics/use-cases/get-college-overview.usecase';
import { GetClubAnalyticsUseCase } from '../../../application/analytics/use-cases/get-club-analytics.usecase';
import { GetEventAnalyticsUseCase } from '../../../application/analytics/use-cases/get-event-analytics.usecase';
import { AnalyticsAuthorizationService } from '../../../application/analytics/services/analytics-authorization.service';
import { EventAuthorizationService } from '../../../application/events/services/event-authorization.service';
import { analyticsRepository } from '../../../infrastructure/database/repositories/analytics.repository';
import { clubRepository } from '../../../infrastructure/database/repositories/club.repository';
import { eventRepository } from '../../../infrastructure/database/repositories/event.repository';
import { membershipRepository } from '../../../infrastructure/database/repositories/membership.repository';
import { AnalyticsController } from '../controllers/analytics.controller';

const analyticsAuthService = new AnalyticsAuthorizationService(membershipRepository);
const eventAuthService = new EventAuthorizationService(membershipRepository);

const getCollegeOverviewUseCase = new GetCollegeOverviewUseCase(
  analyticsRepository,
  analyticsAuthService,
);
const getClubAnalyticsUseCase = new GetClubAnalyticsUseCase(
  analyticsRepository,
  clubRepository,
  analyticsAuthService,
);
const getEventAnalyticsUseCase = new GetEventAnalyticsUseCase(
  analyticsRepository,
  eventRepository,
  eventAuthService,
);

export const analyticsController = new AnalyticsController(
  getCollegeOverviewUseCase,
  getClubAnalyticsUseCase,
  getEventAnalyticsUseCase,
);
