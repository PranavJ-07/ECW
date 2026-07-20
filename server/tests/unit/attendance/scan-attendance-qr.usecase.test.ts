import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScanAttendanceQrUseCase } from '../../../src/application/attendance/use-cases/scan-attendance-qr.usecase';
import { QrTokenService } from '../../../src/application/attendance/services/qr-token.service';
import { CheckInAttendeeUseCase } from '../../../src/application/registrations/use-cases/check-in-attendee.usecase';
import { ConflictError } from '../../../src/domain/errors/auth.errors';
import { QrTokenMismatchError } from '../../../src/domain/errors/attendance.errors';
import { AttendanceCheckInMethod } from '../../../src/domain/enums/attendance.enum';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../../../src/domain/enums/registration.enum';
import { UserRole } from '../../../src/domain/enums/user-role.enum';
import { IAttendanceCheckInRepository } from '../../../src/domain/interfaces/attendance-checkin.repository.interface';

function mockAttendanceRepo(): IAttendanceCheckInRepository {
  return {
    create: vi.fn(),
    findByQrTokenId: vi.fn(),
    listByEvent: vi.fn(),
  };
}

describe('ScanAttendanceQrUseCase', () => {
  let qrTokenService: QrTokenService;
  let checkInAttendeeUseCase: CheckInAttendeeUseCase;
  let attendanceCheckInRepository: IAttendanceCheckInRepository;
  let useCase: ScanAttendanceQrUseCase;

  beforeEach(() => {
    vi.stubEnv('JWT_ACCESS_SECRET', 'test-secret-key-with-enough-length-32chars');
    qrTokenService = new QrTokenService();
    checkInAttendeeUseCase = {
      execute: vi.fn(),
    } as unknown as CheckInAttendeeUseCase;
    attendanceCheckInRepository = mockAttendanceRepo();
    useCase = new ScanAttendanceQrUseCase(
      qrTokenService,
      checkInAttendeeUseCase,
      attendanceCheckInRepository,
    );
  });

  it('scans valid QR and records attendance audit', async () => {
    const signed = qrTokenService.sign({
      collegeId: 'college1',
      eventId: 'event1',
      registrationId: 'reg1',
      userId: 'user1',
    });

    vi.mocked(attendanceCheckInRepository.findByQrTokenId).mockResolvedValue(null);
    vi.mocked(checkInAttendeeUseCase.execute).mockResolvedValue({
      id: 'reg1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      status: RegistrationStatus.ATTENDED,
      approvalStatus: RegistrationApprovalStatus.NOT_REQUIRED,
      registeredAt: new Date(),
      source: RegistrationSource.SELF,
      checkedInAt: new Date(),
      checkedInBy: 'officer1',
      createdAt: new Date(),
    });
    vi.mocked(attendanceCheckInRepository.create).mockResolvedValue({
      id: 'audit1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      registrationId: 'reg1',
      userId: 'user1',
      method: AttendanceCheckInMethod.QR_SCAN,
      qrTokenId: 'jti',
      checkedInAt: new Date(),
      checkedInBy: 'officer1',
      createdAt: new Date(),
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'workshop',
      token: signed.token,
      actorId: 'officer1',
      actorRoles: [UserRole.STUDENT],
    });

    expect(result.method).toBe(AttendanceCheckInMethod.QR_SCAN);
    expect(checkInAttendeeUseCase.execute).toHaveBeenCalledWith({
      collegeId: 'college1',
      eventSlug: 'workshop',
      registrationId: 'reg1',
      actorId: 'officer1',
      actorRoles: [UserRole.STUDENT],
    });
    expect(attendanceCheckInRepository.create).toHaveBeenCalled();
  });

  it('throws when QR token college does not match', async () => {
    const signed = qrTokenService.sign({
      collegeId: 'other-college',
      eventId: 'event1',
      registrationId: 'reg1',
      userId: 'user1',
    });

    await expect(
      useCase.execute({
        collegeId: 'college1',
        eventSlug: 'workshop',
        token: signed.token,
        actorId: 'officer1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(QrTokenMismatchError);
  });

  it('throws when QR token was already used', async () => {
    const signed = qrTokenService.sign({
      collegeId: 'college1',
      eventId: 'event1',
      registrationId: 'reg1',
      userId: 'user1',
    });

    const payload = qrTokenService.verify(signed.token);

    vi.mocked(attendanceCheckInRepository.findByQrTokenId).mockResolvedValue({
      id: 'audit1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      registrationId: 'reg1',
      userId: 'user1',
      method: AttendanceCheckInMethod.QR_SCAN,
      qrTokenId: payload.jti,
      checkedInAt: new Date(),
      checkedInBy: 'officer1',
      createdAt: new Date(),
    });

    await expect(
      useCase.execute({
        collegeId: 'college1',
        eventSlug: 'workshop',
        token: signed.token,
        actorId: 'officer1',
        actorRoles: [UserRole.STUDENT],
      }),
    ).rejects.toThrow(ConflictError);
  });
});
