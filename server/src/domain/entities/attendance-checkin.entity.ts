import { AttendanceCheckInMethod } from '../enums/attendance.enum';

export interface AttendanceCheckIn {
  id: string;
  collegeId: string;
  eventId: string;
  clubId: string;
  registrationId: string;
  userId: string;
  method: AttendanceCheckInMethod;
  qrTokenId?: string;
  checkedInAt: Date;
  checkedInBy: string;
  createdAt: Date;
}

export interface AttendanceCheckInWithUser extends AttendanceCheckIn {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
