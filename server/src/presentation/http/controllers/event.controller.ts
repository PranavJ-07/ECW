import { Request, Response, NextFunction } from 'express';
import { CreateEventUseCase } from '../../../application/events/use-cases/create-event.usecase';
import { ListEventsUseCase } from '../../../application/events/use-cases/list-events.usecase';
import { GetEventUseCase } from '../../../application/events/use-cases/get-event.usecase';
import { UpdateEventUseCase } from '../../../application/events/use-cases/update-event.usecase';
import { PublishEventUseCase } from '../../../application/events/use-cases/publish-event.usecase';
import { CancelEventUseCase } from '../../../application/events/use-cases/cancel-event.usecase';
import { DeleteEventUseCase } from '../../../application/events/use-cases/delete-event.usecase';
import {
  CreateEventDto,
  UpdateEventDto,
  ListEventsQuery,
  parseEventDates,
  parseUpdateEventDates,
} from '../dto/event.dto';

export class EventController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly getEventUseCase: GetEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly publishEventUseCase: PublishEventUseCase,
    private readonly cancelEventUseCase: CancelEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateEventDto;
      const dates = parseEventDates(body);

      const event = await this.createEventUseCase.execute({
        collegeId: req.tenant!.collegeId,
        clubSlug: String(req.params.clubSlug),
        title: body.title,
        slug: body.slug,
        description: body.description,
        coverImageUrl: body.coverImageUrl,
        location: body.location,
        ...dates,
        timezone: body.timezone,
        capacity: body.capacity,
        requiresApproval: body.requiresApproval,
        visibility: body.visibility,
        tags: body.tags,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListEventsQuery;
      const result = await this.listEventsUseCase.execute({
        collegeId: req.tenant!.collegeId,
        ...query,
      });

      res.status(200).json({
        success: true,
        data: result.events,
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
      const event = await this.getEventUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        userId: req.authUser?.userId,
        actorRoles: req.authUser?.roles,
      });

      res.status(200).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as UpdateEventDto;
      const dateFields = parseUpdateEventDates(body);
      const { startAt: _s, endAt: _e, registrationOpensAt: _o, registrationClosesAt: _c, ...rest } = body;

      const event = await this.updateEventUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        data: {
          ...rest,
          ...dateFields,
        },
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  };

  publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await this.publishEventUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({
        success: true,
        data: { status: event.status, publishedAt: event.publishedAt },
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await this.cancelEventUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        reason: req.body?.reason,
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(200).json({
        success: true,
        data: {
          status: event.status,
          cancelledAt: event.cancelledAt,
          cancelReason: event.cancelReason,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteEventUseCase.execute({
        collegeId: req.tenant!.collegeId,
        eventSlug: String(req.params.eventSlug),
        actorId: req.authUser!.userId,
        actorRoles: req.authUser!.roles,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
