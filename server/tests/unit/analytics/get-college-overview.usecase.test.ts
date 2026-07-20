import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCollegeOverviewUseCase } from '../../../src/application/analytics/use-cases/get-college-overview.usecase';
import { AnalyticsAuthorizationService } from '../../../src/application/analytics/services/analytics-authorization.service';
import { ForbiddenError } from '../../../src/domain/errors';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IAnalyticsRepository } from '../../../src/domain/interfaces/analytics.repository.interface';

function mockAnalyticsRepo(): IAnalyticsRepository {
  return {
    getCollegeOverview: vi.fn(),
    getClubAnalytics: vi.fn(),
    getEventAnalytics: vi.fn(),
  };
}

describe('GetCollegeOverviewUseCase', () => {
  let analyticsRepository: IAnalyticsRepository;
  let useCase: GetCollegeOverviewUseCase;

  beforeEach(() => {
    analyticsRepository = mockAnalyticsRepo();
    useCase = new GetCollegeOverviewUseCase(
      analyticsRepository,
      new AnalyticsAuthorizationService({
        isActiveOfficer: vi.fn(),
        isActivePresident: vi.fn(),
        getActiveRole: vi.fn(),
        hasActiveMembership: vi.fn(),
      }),
    );
  });

  it('returns college overview for admin', async () => {
    vi.mocked(analyticsRepository.getCollegeOverview).mockResolvedValue({
      collegeId: 'college1',
      generatedAt: new Date(),
      clubs: { total: 10, active: 8 },
      events: { total: 25, published: 20, upcoming: 5, cancelled: 2 },
      registrations: { total: 500, attended: 350, attendanceRate: 70 },
      memberships: { active: 1200 },
      certificates: { issued: 300 },
      topClubs: [],
      registrationTrend: [],
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      actorRoles: [UserRole.COLLEGE_ADMIN],
    });

    expect(result.clubs.total).toBe(10);
    expect(analyticsRepository.getCollegeOverview).toHaveBeenCalledWith('college1', undefined);
  });

  it('denies non-admin users', async () => {
    await expect(
      useCase.execute({ collegeId: 'college1', actorRoles: [UserRole.STUDENT] }),
    ).rejects.toThrow(ForbiddenError);
  });
});
