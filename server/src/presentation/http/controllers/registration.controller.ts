import { Request, Response, NextFunction } from 'express';
import { RegisterForEventUseCase } from '../../../application/registrations/use-cases/register-for-event.usecase';
import { CancelRegistrationUseCase } from '../../../application/registrations/use-cases/cancel-registration.usecase';
import { ListEventRegistrationsUseCase } from '../../../application/registrations/use-cases/list-event-registrations.usecase';
import { CheckInAttendeeUseCase } from '../../../application/registrations/use-cases/check-in-attendee.usecase';
import { GetMyRegistrationsUseCase } from '../../../application/registrations/use-cases/get-my-registrations.usecase';
import { RegisterForEventDto, CheckInDto, ListRegistrationsQuery, MyRegistrationsQuery } from '../dto/registration.dto';

export class RegistrationController {
  constructor(
    private readonly registerForEventUseCase: RegisterForEventUseCase,
    private readonly cancelRegistrationUseCase: CancelRegistrationUseCase,
    private readonly listEventRegistrationsUseCase: ListEventRegistrationsUseCase,
    private readonly checkInAttendeeUseCase: CheckInAttendeeUseCase,
    private readonly getMyRegistrationsUseCase: GetMyRegistrationsUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RegisterForEventDto;
      const registration = await this.registerForEventUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        userId: req.authUser!.userId,
        emailVerified: req.authUser!.emailVerified,
        idempotencyKey: body.idempotencyKey,
      });

      res.status(201).json({ success: true, data: registration });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registration = await this.cancelRegistrationUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        userId: req.authUser!.userId,
      });

      res.status(200).json({
        success: true,
        data: { message: 'Registration cancelled', status: registration.status },
      });
    } catch (error) {
      next(error);
    }
  };

  listByEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListRegistrationsQuery;
      const result = await this.listEventRegistrationsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        status: query.status,
        search: query.search,
        page: query.page,
        limit: query.limit,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({
        success: true,
        data: result.registrations,
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

  checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CheckInDto;
      const registration = await this.checkInAttendeeUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        registrationId: body.registrationId,
        userId: body.userId,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({ success: true, data: registration });
    } catch (error) {
      next(error);
    }
  };

  myRegistrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as MyRegistrationsQuery;
      const result = await this.getMyRegistrationsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        userId: req.authUser!.userId,
        status: query.status,
        page: query.page,
        limit: query.limit,
      });

      res.status(200).json({
        success: true,
        data: result.registrations,
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
