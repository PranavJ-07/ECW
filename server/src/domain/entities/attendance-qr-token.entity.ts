/**
 * Payload embedded in a signed attendance QR JWT.
 * The client renders `token` as a QR code; officers scan and POST it back.
 */
export interface AttendanceQrTokenPayload {
  typ: 'attendance_qr';
  collegeId: string;
  eventId: string;
  registrationId: string;
  userId: string;
  jti: string;
}

export interface AttendanceQrTokenResponse {
  token: string;
  expiresAt: Date;
  expiresInSeconds: number;
  registrationId: string;
  eventId: string;
}
