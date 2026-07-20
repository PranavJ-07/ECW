import { EventAuthorizationService } from '../../../application/events/services/event-authorization.service';
import { CreateEventUseCase } from '../../../application/events/use-cases/create-event.usecase';
import { ListEventsUseCase } from '../../../application/events/use-cases/list-events.usecase';
import { GetEventUseCase } from '../../../application/events/use-cases/get-event.usecase';
import { UpdateEventUseCase } from '../../../application/events/use-cases/update-event.usecase';
import { PublishEventUseCase } from '../../../application/events/use-cases/publish-event.usecase';
import { CancelEventUseCase } from '../../../application/events/use-cases/cancel-event.usecase';
import { DeleteEventUseCase } from '../../../application/events/use-cases/delete-event.usecase';
import { eventRepository } from '../../../infrastructure/database/repositories/event.repository';
import { clubRepository } from '../../../infrastructure/database/repositories/club.repository';
import { membershipRepository } from '../../../infrastructure/database/repositories/membership.repository';
import { EventController } from '../controllers/event.controller';

const eventAuthService = new EventAuthorizationService(membershipRepository);

const createEventUseCase = new CreateEventUseCase(
  eventRepository,
  clubRepository,
  eventAuthService,
);
const listEventsUseCase = new ListEventsUseCase(eventRepository, clubRepository);
const getEventUseCase = new GetEventUseCase(eventRepository, clubRepository, eventAuthService);
const updateEventUseCase = new UpdateEventUseCase(eventRepository, eventAuthService);
const publishEventUseCase = new PublishEventUseCase(eventRepository, eventAuthService);
const cancelEventUseCase = new CancelEventUseCase(eventRepository, eventAuthService);
const deleteEventUseCase = new DeleteEventUseCase(eventRepository, eventAuthService);

export const eventController = new EventController(
  createEventUseCase,
  listEventsUseCase,
  getEventUseCase,
  updateEventUseCase,
  publishEventUseCase,
  cancelEventUseCase,
  deleteEventUseCase,
);
