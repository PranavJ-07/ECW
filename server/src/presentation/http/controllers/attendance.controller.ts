import { Request, Response, NextFunction } from 'express';
import { GenerateAttendanceQrUseCase } from '../../../application/attendance/use-cases/generate-attendance-qr.usecase';
import { ScanAttendanceQrUseCase } from '../../../application/attendance/use-cases/scan-attendance-qr.usecase';
import { ListAttendanceCheckInsUseCase } from '../../../application/attendance/use-cases/list-attendance-checkins.usecase';
import { ListAttendanceQuery, ScanAttendanceQrDto } from '../dto/attendance.dto';

export class AttendanceController {
  constructor(
    private readonly generateAttendanceQrUseCase: GenerateAttendanceQrUseCase,
    private readonly scanAttendanceQrUseCase: ScanAttendanceQrUseCase,
    private readonly listAttendanceCheckInsUseCase: ListAttendanceCheckInsUseCase,
  ) {}

  generateQr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const qr = await this.generateAttendanceQrUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        userId: req.authUser!.userId,
      });

      res.status(200).json({
        success: true,
        data: {
          token: qr.token,
          expiresAt: qr.expiresAt.toISOString(),
          expiresInSeconds: qr.expiresInSeconds,
          registrationId: qr.registrationId,
          eventId: qr.eventId,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  scanQr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as ScanAttendanceQrDto;
      const result = await this.scanAttendanceQrUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        token: body.token,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({
        success: true,
        data: {
          registration: result.registration,
          method: result.method,
          qrTokenId: result.qrTokenId,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  listCheckIns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListAttendanceQuery;
      const result = await this.listAttendanceCheckInsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        page: query.page,
        limit: query.limit,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({
        success: true,
        data: result.checkIns,
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
}
