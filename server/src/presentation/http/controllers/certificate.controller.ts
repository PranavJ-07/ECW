import { Request, Response, NextFunction } from 'express';
import { IssueCertificatesUseCase } from '../../../application/certificates/use-cases/issue-certificates.usecase';
import { ListEventCertificatesUseCase } from '../../../application/certificates/use-cases/list-event-certificates.usecase';
import { GetMyCertificatesUseCase } from '../../../application/certificates/use-cases/get-my-certificates.usecase';
import { GetMyCertificateUseCase } from '../../../application/certificates/use-cases/get-certificate.usecase';
import { RevokeCertificateUseCase } from '../../../application/certificates/use-cases/revoke-certificate.usecase';
import { VerifyCertificateUseCase } from '../../../application/certificates/use-cases/verify-certificate.usecase';
import {
  IssueCertificatesDto,
  RevokeCertificateDto,
  ListCertificatesQuery,
} from '../dto/certificate.dto';

export class CertificateController {
  constructor(
    private readonly issueCertificatesUseCase: IssueCertificatesUseCase,
    private readonly listEventCertificatesUseCase: ListEventCertificatesUseCase,
    private readonly getMyCertificatesUseCase: GetMyCertificatesUseCase,
    private readonly getMyCertificateUseCase: GetMyCertificateUseCase,
    private readonly revokeCertificateUseCase: RevokeCertificateUseCase,
    private readonly verifyCertificateUseCase: VerifyCertificateUseCase,
  ) {}

  issue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as IssueCertificatesDto;
      const result = await this.issueCertificatesUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        userIds: body.userIds,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  listByEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListCertificatesQuery;
      const result = await this.listEventCertificatesUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        status: query.status,
        page: query.page,
        limit: query.limit,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({
        success: true,
        data: result.certificates,
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

  myCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListCertificatesQuery;
      const result = await this.getMyCertificatesUseCase.execute({
        collegeId: req.tenant!.collegeId,
        userId: req.authUser!.userId,
        status: query.status,
        page: query.page,
        limit: query.limit,
      });

      res.status(200).json({
        success: true,
        data: result.certificates,
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

  getMyCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certificate = await this.getMyCertificateUseCase.execute({
        collegeId: req.tenant!.collegeId,
        certificateId: String(req.params.certificateId),
        userId: req.authUser!.userId,
      });

      res.status(200).json({ success: true, data: certificate });
    } catch (error) {
      next(error);
    }
  };

  revoke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RevokeCertificateDto;
      const certificate = await this.revokeCertificateUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        certificateId: String(req.params.certificateId),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
        reason: body.reason,
      });

      res.status(200).json({
        success: true,
        data: { message: 'Certificate revoked', certificate },
      });
    } catch (error) {
      next(error);
    }
  };

  verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const view = await this.verifyCertificateUseCase.execute(String(req.params.verificationCode));

      res.status(200).json({ success: true, data: view });
    } catch (error) {
      next(error);
    }
  };
}
