import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../../../config';
import {
  AttendanceQrTokenPayload,
  AttendanceQrTokenResponse,
} from '../../../domain/entities/attendance-qr-token.entity';
import {
  InvalidQrTokenError,
  QrTokenExpiredError,
} from '../../../domain/errors/attendance.errors';

export interface SignAttendanceQrInput {
  collegeId: string;
  eventId: string;
  registrationId: string;
  userId: string;
}

/**
 * Signs and verifies short-lived JWTs embedded in attendee QR codes.
 * Uses a dedicated secret when configured; falls back to JWT_ACCESS_SECRET in dev.
 */
export class QrTokenService {
  private get secret(): string {
    return env.ATTENDANCE_QR_SECRET ?? env.JWT_ACCESS_SECRET;
  }

  private get ttlSeconds(): number {
    return env.ATTENDANCE_QR_TTL_MINUTES * 60;
  }

  sign(input: SignAttendanceQrInput): AttendanceQrTokenResponse {
    const jti = randomUUID();
    const expiresInSeconds = this.ttlSeconds;

    const payload: AttendanceQrTokenPayload = {
      typ: 'attendance_qr',
      collegeId: input.collegeId,
      eventId: input.eventId,
      registrationId: input.registrationId,
      userId: input.userId,
      jti,
    };

    const token = jwt.sign(payload, this.secret, { expiresIn: expiresInSeconds });
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      token,
      expiresAt,
      expiresInSeconds,
      registrationId: input.registrationId,
      eventId: input.eventId,
    };
  }

  verify(token: string): AttendanceQrTokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as AttendanceQrTokenPayload;

      if (decoded.typ !== 'attendance_qr') {
        throw new InvalidQrTokenError();
      }

      if (
        !decoded.collegeId ||
        !decoded.eventId ||
        !decoded.registrationId ||
        !decoded.userId ||
        !decoded.jti
      ) {
        throw new InvalidQrTokenError();
      }

      return decoded;
    } catch (error) {
      if (error instanceof InvalidQrTokenError) {
        throw error;
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new QrTokenExpiredError();
      }

      throw new InvalidQrTokenError();
    }
  }
}

export const qrTokenService = new QrTokenService();
