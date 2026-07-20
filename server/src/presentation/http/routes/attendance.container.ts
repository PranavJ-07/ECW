import { GenerateAttendanceQrUseCase } from '../../../application/attendance/use-cases/generate-attendance-qr.usecase';
import { ScanAttendanceQrUseCase } from '../../../application/attendance/use-cases/scan-attendance-qr.usecase';
import { ListAttendanceCheckInsUseCase } from '../../../application/attendance/use-cases/list-attendance-checkins.usecase';
import { QrTokenService } from '../../../application/attendance/services/qr-token.service';
import { CheckInWindowService } from '../../../application/attendance/services/check-in-window.service';
import { CheckInAttendeeUseCase } from '../../../application/registrations/use-cases/check-in-attendee.usecase';
import { EventAuthorizationService } from '../../../application/events/services/event-authorization.service';
import { attendanceCheckInRepository } from '../../../infrastructure/database/repositories/attendance-checkin.repository';
import { registrationRepository } from '../../../infrastructure/database/repositories/registration.repository';
import { eventRepository } from '../../../infrastructure/database/repositories/event.repository';
import { membershipRepository } from '../../../infrastructure/database/repositories/membership.repository';
import { AttendanceController } from '../controllers/attendance.controller';

const eventAuthService = new EventAuthorizationService(membershipRepository);
const checkInWindowService = new CheckInWindowService();
const qrTokenService = new QrTokenService();

const checkInAttendeeUseCase = new CheckInAttendeeUseCase(
  registrationRepository,
  eventRepository,
  eventAuthService,
  checkInWindowService,
);

const generateAttendanceQrUseCase = new GenerateAttendanceQrUseCase(
  registrationRepository,
  eventRepository,
  qrTokenService,
  checkInWindowService,
);

const scanAttendanceQrUseCase = new ScanAttendanceQrUseCase(
  qrTokenService,
  checkInAttendeeUseCase,
  attendanceCheckInRepository,
);

const listAttendanceCheckInsUseCase = new ListAttendanceCheckInsUseCase(
  attendanceCheckInRepository,
  eventRepository,
  eventAuthService,
);

export const attendanceController = new AttendanceController(
  generateAttendanceQrUseCase,
  scanAttendanceQrUseCase,
  listAttendanceCheckInsUseCase,
);
