import { Request, Response, NextFunction } from 'express';
import { CreateClubUseCase } from '../../../application/clubs/use-cases/create-club.usecase';
import { ListClubsUseCase } from '../../../application/clubs/use-cases/list-clubs.usecase';
import { GetClubUseCase } from '../../../application/clubs/use-cases/get-club.usecase';
import { UpdateClubUseCase } from '../../../application/clubs/use-cases/update-club.usecase';
import { ArchiveClubUseCase } from '../../../application/clubs/use-cases/archive-club.usecase';
import { CreateClubDto, UpdateClubDto, ListClubsQuery } from '../dto/club.dto';

/**
 * HTTP adapter for club endpoints.
 * Delegates all business logic to use cases.
 */
export class ClubController {
  constructor(
    private readonly createClubUseCase: CreateClubUseCase,
    private readonly listClubsUseCase: ListClubsUseCase,
    private readonly getClubUseCase: GetClubUseCase,
    private readonly updateClubUseCase: UpdateClubUseCase,
    private readonly archiveClubUseCase: ArchiveClubUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateClubDto;
      const club = await this.createClubUseCase.execute({
        collegeSlug: req.tenant!.collegeSlug,
        collegeId: req.tenant!.collegeId,
        ...body,
        createdBy: req.authUser!.userId,
      });

      res.status(201).json({ success: true, data: club });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListClubsQuery;
      const result = await this.listClubsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        ...query,
      });

      res.status(200).json({
        success: true,
        data: result.clubs,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const club = await this.getClubUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        userId: req.authUser?.userId,
      });

      res.status(200).json({ success: true, data: club });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as UpdateClubDto;
      const club = await this.updateClubUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        data: body,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({ success: true, data: club });
    } catch (error) {
      next(error);
    }
  };

  archive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const club = await this.archiveClubUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({
        success: true,
        data: { message: 'Club archived', status: club.status },
      });
    } catch (error) {
      next(error);
    }
  };
}
