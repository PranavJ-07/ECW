import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.stubEnv('JWT_ACCESS_SECRET', 'test-secret-key-with-enough-length-32chars');
vi.stubEnv('ATTENDANCE_QR_TTL_MINUTES', '10');

import { QrTokenService } from '../../../src/application/attendance/services/qr-token.service';
import {
  InvalidQrTokenError,
  QrTokenExpiredError,
} from '../../../src/domain/errors/attendance.errors';

describe('QrTokenService', () => {
  let service: QrTokenService;

  beforeEach(() => {
    service = new QrTokenService();
  });

  it('signs and verifies a valid attendance QR token', () => {
    const signed = service.sign({
      collegeId: 'college1',
      eventId: 'event1',
      registrationId: 'reg1',
      userId: 'user1',
    });

    const payload = service.verify(signed.token);

    expect(payload.typ).toBe('attendance_qr');
    expect(payload.collegeId).toBe('college1');
    expect(payload.eventId).toBe('event1');
    expect(payload.registrationId).toBe('reg1');
    expect(payload.userId).toBe('user1');
    expect(payload.jti).toBeTruthy();
    expect(signed.expiresInSeconds).toBe(600);
  });

  it('throws on tampered token', () => {
    const signed = service.sign({
      collegeId: 'college1',
      eventId: 'event1',
      registrationId: 'reg1',
      userId: 'user1',
    });

    expect(() => service.verify(`${signed.token}x`)).toThrow(InvalidQrTokenError);
  });

  it('throws when token is expired', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    const shortTtlService = new QrTokenService();
    const signed = shortTtlService.sign({
      collegeId: 'college1',
      eventId: 'event1',
      registrationId: 'reg1',
      userId: 'user1',
    });

    vi.setSystemTime(new Date('2026-01-01T01:00:00Z'));

    expect(() => shortTtlService.verify(signed.token)).toThrow(QrTokenExpiredError);

    vi.useRealTimers();
  });
});
