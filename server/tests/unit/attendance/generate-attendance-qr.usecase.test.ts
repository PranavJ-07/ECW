import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerateAttendanceQrUseCase } from '../../../src/application/attendance/use-cases/generate-attendance-qr.usecase';
import { QrTokenService } from '../../../src/application/attendance/services/qr-token.service';
import { CheckInWindowService } from '../../../src/application/attendance/services/check-in-window.service';
import { QrGenerationNotAvailableError } from '../../../src/domain/errors/attendance.errors';
import { RegistrationNotFoundError } from '../../../src/domain/errors/registration.errors';
import { EventLocationMode, EventStatus, EventVisibility } from '../../../src/domain/enums/event.enum';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../../../src/domain/enums/registration.enum';
import { IEventRepository } from '../../../src/domain/interfaces/event.repository.interface';
import { IRegistrationRepository } from '../../../src/domain/interfaces/registration.repository.interface';

const mockEvent = {
  id: 'event1',
  collegeId: 'college1',
  clubId: 'club1',
  title: 'Workshop',
  slug: 'workshop',
  location: { mode: EventLocationMode.ONSITE },
  startAt: new Date('2026-08-01T10:00:00Z'),
  endAt: new Date('2026-08-01T14:00:00Z'),
  timezone: 'America/New_York',
  registrationCount: 1,
  waitlistCount: 0,
  requiresApproval: false,
  status: EventStatus.PUBLISHED,
  visibility: EventVisibility.COLLEGE_ONLY,
  tags: [],
  createdBy: 'admin1',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockRegistrationRepo(): IRegistrationRepository {
  return {
    findByEventAndUser: vi.fn(),
    findById: vi.fn(),
    findByIdempotencyKey: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    listByEvent: vi.fn(),
    listByUser: vi.fn(),
    findOldestWaitlisted: vi.fn(),
  };
}

function mockEventRepo(): IEventRepository {
  return {
    findBySlug: vi.fn(),
    findById: vi.fn(),
    slugExists: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    cancel: vi.fn(),
    softDelete: vi.fn(),
    list: vi.fn(),
    reserveRegistrationSlot: vi.fn(),
    releaseRegistrationSlot: vi.fn(),
    promoteWaitlistSlot: vi.fn(),
  };
}

describe('GenerateAttendanceQrUseCase', () => {
  let registrationRepository: IRegistrationRepository;
  let eventRepository: IEventRepository;
  let qrTokenService: QrTokenService;
  let checkInWindowService: CheckInWindowService;
  let useCase: GenerateAttendanceQrUseCase;

  beforeEach(() => {
    vi.stubEnv('JWT_ACCESS_SECRET', 'test-secret-key-with-enough-length-32chars');
    registrationRepository = mockRegistrationRepo();
    eventRepository = mockEventRepo();
    qrTokenService = new QrTokenService();
    checkInWindowService = new CheckInWindowService();
    useCase = new GenerateAttendanceQrUseCase(
      registrationRepository,
      eventRepository,
      qrTokenService,
      checkInWindowService,
    );
  });

  it('generates QR token for registered attendee during check-in window', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T11:00:00Z'));

    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue({
      id: 'reg1',
      collegeId: 'college1',
      eventId: 'event1',
      clubId: 'club1',
      userId: 'user1',
      status: RegistrationStatus.REGISTERED,
      approvalStatus: RegistrationApprovalStatus.NOT_REQUIRED,
      registeredAt: new Date(),
      source: RegistrationSource.SELF,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      collegeId: 'college1',
      eventSlug: 'workshop',
      userId: 'user1',
    });

    expect(result.token).toBeTruthy();
    expect(result.registrationId).toBe('reg1');

    vi.useRealTimers();
  });

  it('throws when user is not registered', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T11:00:00Z'));

    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);
    vi.mocked(registrationRepository.findByEventAndUser).mockResolvedValue(null);

    await expect(
      useCase.execute({ collegeId: 'college1', eventSlug: 'workshop', userId: 'user1' }),
    ).rejects.toThrow(RegistrationNotFoundError);

    vi.useRealTimers();
  });

  it('throws when outside check-in window', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T00:00:00Z'));

    vi.mocked(eventRepository.findBySlug).mockResolvedValue(mockEvent);

    await expect(
      useCase.execute({ collegeId: 'college1', eventSlug: 'workshop', userId: 'user1' }),
    ).rejects.toThrow(QrGenerationNotAvailableError);

    vi.useRealTimers();
  });
});
