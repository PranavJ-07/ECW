import { ConflictError } from '../../../domain/errors/auth.errors';
import { QrTokenMismatchError } from '../../../domain/errors/attendance.errors';
import { Registration } from '../../../domain/entities/registration.entity';
import { AttendanceCheckInMethod } from '../../../domain/enums/attendance.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IAttendanceCheckInRepository } from '../../../domain/interfaces/attendance-checkin.repository.interface';
import { CheckInAttendeeUseCase } from '../../registrations/use-cases/check-in-attendee.usecase';
import { QrTokenService } from '../services/qr-token.service';

export interface ScanAttendanceQrInput {
  collegeId: string;
  eventSlug: string;
  token: string;
  actorId: string;
  actorRoles: UserRole[];
}

export interface ScanAttendanceQrResult {
  registration: Registration;
  method: AttendanceCheckInMethod;
  qrTokenId: string;
}

/**
 * Validates a scanned QR token and records attendance via the existing check-in flow.
 */
export class ScanAttendanceQrUseCase {
  constructor(
    private readonly qrTokenService: QrTokenService,
    private readonly checkInAttendeeUseCase: CheckInAttendeeUseCase,
    private readonly attendanceCheckInRepository: IAttendanceCheckInRepository,
  ) {}

  async execute(input: ScanAttendanceQrInput): Promise<ScanAttendanceQrResult> {
    const payload = this.qrTokenService.verify(input.token);

    if (payload.collegeId !== input.collegeId) {
      throw new QrTokenMismatchError();
    }

    const existingScan = await this.attendanceCheckInRepository.findByQrTokenId(payload.jti);

    if (existingScan) {
      throw new ConflictError('This QR code was already scanned', 'QR_ALREADY_USED');
    }

    const registration = await this.checkInAttendeeUseCase.execute({
      collegeId: input.collegeId,
      eventSlug: input.eventSlug,
      registrationId: payload.registrationId,
      actorId: input.actorId,
      actorRoles: input.actorRoles,
    });

    if (registration.eventId !== payload.eventId || registration.userId !== payload.userId) {
      throw new QrTokenMismatchError();
    }

    try {
      await this.attendanceCheckInRepository.create({
        collegeId: input.collegeId,
        eventId: registration.eventId,
        clubId: registration.clubId,
        registrationId: registration.id,
        userId: registration.userId,
        method: AttendanceCheckInMethod.QR_SCAN,
        qrTokenId: payload.jti,
        checkedInBy: input.actorId,
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictError('This QR code was already scanned', 'QR_ALREADY_USED');
      }

      throw error;
    }

    return {
      registration,
      method: AttendanceCheckInMethod.QR_SCAN,
      qrTokenId: payload.jti,
    };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    );
  }
}
