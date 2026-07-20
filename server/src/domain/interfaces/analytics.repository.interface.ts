import {
  AnalyticsDateRange,
  ClubAnalytics,
  CollegeOverviewAnalytics,
  EventAnalytics,
} from '../entities/analytics.entity';

export interface IAnalyticsRepository {
  getCollegeOverview(collegeId: string, period?: AnalyticsDateRange): Promise<CollegeOverviewAnalytics>;
  getClubAnalytics(
    collegeId: string,
    clubId: string,
    period?: AnalyticsDateRange,
  ): Promise<ClubAnalytics>;
  getEventAnalytics(collegeId: string, eventId: string): Promise<EventAnalytics>;
}
