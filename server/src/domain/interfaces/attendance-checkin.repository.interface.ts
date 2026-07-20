import {
  AttendanceCheckIn,
  AttendanceCheckInWithUser,
} from '../entities/attendance-checkin.entity';
import { AttendanceCheckInMethod } from '../enums/attendance.enum';

export interface CreateAttendanceCheckInData {
  collegeId: string;
  eventId: string;
  clubId: string;
  registrationId: string;
  userId: string;
  method: AttendanceCheckInMethod;
  qrTokenId?: string;
  checkedInBy: string;
}

export interface ListAttendanceCheckInsFilter {
  collegeId: string;
  eventId: string;
  page: number;
  limit: number;
}

export interface PaginatedAttendanceCheckIns {
  checkIns: AttendanceCheckInWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAttendanceCheckInRepository {
  create(data: CreateAttendanceCheckInData): Promise<AttendanceCheckIn>;
  findByQrTokenId(qrTokenId: string): Promise<AttendanceCheckIn | null>;
  listByEvent(filter: ListAttendanceCheckInsFilter): Promise<PaginatedAttendanceCheckIns>;
}
