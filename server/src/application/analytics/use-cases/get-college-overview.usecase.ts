import { UserRole } from '../../../domain/enums/user-role.enum';
import { AnalyticsDateRange, CollegeOverviewAnalytics } from '../../../domain/entities/analytics.entity';
import { IAnalyticsRepository } from '../../../domain/interfaces/analytics.repository.interface';
import { AnalyticsAuthorizationService } from '../services/analytics-authorization.service';

export interface GetCollegeOverviewInput {
  collegeId: string;
  from?: Date;
  to?: Date;
  actorRoles: UserRole[];
}

export class GetCollegeOverviewUseCase {
  constructor(
    private readonly analyticsRepository: IAnalyticsRepository,
    private readonly analyticsAuthService: AnalyticsAuthorizationService,
  ) {}

  async execute(input: GetCollegeOverviewInput): Promise<CollegeOverviewAnalytics> {
    this.analyticsAuthService.assertCanViewCollegeAnalytics(input.actorRoles);

    const period: AnalyticsDateRange | undefined =
      input.from || input.to ? { from: input.from, to: input.to } : undefined;

    return this.analyticsRepository.getCollegeOverview(input.collegeId, period);
  }
}
