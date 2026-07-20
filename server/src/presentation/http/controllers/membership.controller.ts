import { Request, Response, NextFunction } from 'express';
import { GetMyClubsUseCase } from '../../../application/memberships/use-cases/get-my-clubs.usecase';
import { GetMyAdvisedClubsUseCase } from '../../../application/clubs/use-cases/get-my-advised-clubs.usecase';
import { MyClubsQuery } from '../dto/membership.dto';

export class MembershipController {
  constructor(
    private readonly getMyClubsUseCase: GetMyClubsUseCase,
    private readonly getMyAdvisedClubsUseCase: GetMyAdvisedClubsUseCase,
  ) {}

  myClubs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as MyClubsQuery;
      const clubs = await this.getMyClubsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        userId: req.authUser!.userId,
        officerOnly: query.officerOnly,
      });

      res.status(200).json({ success: true, data: clubs });
    } catch (error) {
      next(error);
    }
  };

  myAdvisedClubs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clubs = await this.getMyAdvisedClubsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        userId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({ success: true, data: clubs });
    } catch (error) {
      next(error);
    }
  };
}
