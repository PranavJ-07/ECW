import { RegisterForEventUseCase } from '../../../application/registrations/use-cases/register-for-event.usecase';
import { CancelRegistrationUseCase } from '../../../application/registrations/use-cases/cancel-registration.usecase';
import { ListEventRegistrationsUseCase } from '../../../application/registrations/use-cases/list-event-registrations.usecase';
import { CheckInAttendeeUseCase } from '../../../application/registrations/use-cases/check-in-attendee.usecase';
import { GetMyRegistrationsUseCase } from '../../../application/registrations/use-cases/get-my-registrations.usecase';
import { EventAuthorizationService } from '../../../application/events/services/event-authorization.service';
import { registrationRepository } from '../../../infrastructure/database/repositories/registration.repository';
import { eventRepository } from '../../../infrastructure/database/repositories/event.repository';
import { membershipRepository } from '../../../infrastructure/database/repositories/membership.repository';
import { RegistrationController } from '../controllers/registration.controller';

const eventAuthService = new EventAuthorizationService(membershipRepository);

const registerForEventUseCase = new RegisterForEventUseCase(
  registrationRepository,
  eventRepository,
  membershipRepository,
);
const cancelRegistrationUseCase = new CancelRegistrationUseCase(
  registrationRepository,
  eventRepository,
);
const listEventRegistrationsUseCase = new ListEventRegistrationsUseCase(
  registrationRepository,
  eventRepository,
  eventAuthService,
);
const checkInAttendeeUseCase = new CheckInAttendeeUseCase(
  registrationRepository,
  eventRepository,
  eventAuthService,
);
const getMyRegistrationsUseCase = new GetMyRegistrationsUseCase(registrationRepository);

export const registrationController = new RegistrationController(
  registerForEventUseCase,
  cancelRegistrationUseCase,
  listEventRegistrationsUseCase,
  checkInAttendeeUseCase,
  getMyRegistrationsUseCase,
);
