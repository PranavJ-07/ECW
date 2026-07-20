import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { AnalyticsDateRange, ClubAnalytics } from '../../../domain/entities/analytics.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IAnalyticsRepository } from '../../../domain/interfaces/analytics.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';
import { AnalyticsAuthorizationService } from '../services/analytics-authorization.service';

export interface GetClubAnalyticsInput {
  collegeId: string;
  clubSlug: string;
  from?: Date;
  to?: Date;
  actorId: string;
  actorRoles: UserRole[];
}

export class GetClubAnalyticsUseCase {
  constructor(
    private readonly analyticsRepository: IAnalyticsRepository,
    private readonly clubRepository: IClubRepository,
    private readonly analyticsAuthService: AnalyticsAuthorizationService,
  ) {}

  async execute(input: GetClubAnalyticsInput): Promise<ClubAnalytics> {
    const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);

    if (!club || club.isDeleted) {
      throw new ClubNotFoundError();
    }

    await this.analyticsAuthService.assertCanViewClubAnalytics(
      club.id,
      input.actorId,
      input.actorRoles,
    );

    const period: AnalyticsDateRange | undefined =
      input.from || input.to ? { from: input.from, to: input.to } : undefined;

    return this.analyticsRepository.getClubAnalytics(input.collegeId, club.id, period);
  }
}
