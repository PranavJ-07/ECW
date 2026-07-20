import { Request, Response, NextFunction } from 'express';
import { GetCollegeOverviewUseCase } from '../../../application/analytics/use-cases/get-college-overview.usecase';
import { GetClubAnalyticsUseCase } from '../../../application/analytics/use-cases/get-club-analytics.usecase';
import { GetEventAnalyticsUseCase } from '../../../application/analytics/use-cases/get-event-analytics.usecase';
import { AnalyticsDateRangeQuery } from '../dto/analytics.dto';

export class AnalyticsController {
  constructor(
    private readonly getCollegeOverviewUseCase: GetCollegeOverviewUseCase,
    private readonly getClubAnalyticsUseCase: GetClubAnalyticsUseCase,
    private readonly getEventAnalyticsUseCase: GetEventAnalyticsUseCase,
  ) {}

  collegeOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as AnalyticsDateRangeQuery;
      const data = await this.getCollegeOverviewUseCase.execute({
        collegeId: req.tenant!.collegeId,
        from: query.from,
        to: query.to,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  clubAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as AnalyticsDateRangeQuery;
      const data = await this.getClubAnalyticsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        from: query.from,
        to: query.to,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  eventAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.getEventAnalyticsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
