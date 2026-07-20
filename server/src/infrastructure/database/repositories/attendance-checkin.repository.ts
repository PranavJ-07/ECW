import {
  AttendanceCheckIn,
  AttendanceCheckInWithUser,
} from '../../../domain/entities/attendance-checkin.entity';
import { AttendanceCheckInMethod } from '../../../domain/enums/attendance.enum';
import {
  CreateAttendanceCheckInData,
  IAttendanceCheckInRepository,
  ListAttendanceCheckInsFilter,
  PaginatedAttendanceCheckIns,
} from '../../../domain/interfaces/attendance-checkin.repository.interface';
import {
  AttendanceCheckInDocument,
  AttendanceCheckInModel,
} from '../models/attendance-checkin.model';

function toEntity(doc: AttendanceCheckInDocument): AttendanceCheckIn {
  return {
    id: doc._id.toString(),
    collegeId: doc.collegeId.toString(),
    eventId: doc.eventId.toString(),
    clubId: doc.clubId.toString(),
    registrationId: doc.registrationId.toString(),
    userId: doc.userId.toString(),
    method: doc.method as AttendanceCheckInMethod,
    qrTokenId: doc.qrTokenId,
    checkedInAt: doc.checkedInAt,
    checkedInBy: doc.checkedInBy.toString(),
    createdAt: doc.createdAt,
  };
}

export class MongoAttendanceCheckInRepository implements IAttendanceCheckInRepository {
  async create(data: CreateAttendanceCheckInData): Promise<AttendanceCheckIn> {
    const doc = await AttendanceCheckInModel.create({
      ...data,
      checkedInAt: new Date(),
    });

    return toEntity(doc);
  }

  async findByQrTokenId(qrTokenId: string): Promise<AttendanceCheckIn | null> {
    const doc = await AttendanceCheckInModel.findOne({ qrTokenId });
    return doc ? toEntity(doc) : null;
  }

  async listByEvent(filter: ListAttendanceCheckInsFilter): Promise<PaginatedAttendanceCheckIns> {
    const query = {
      collegeId: filter.collegeId,
      eventId: filter.eventId,
    };

    const skip = (filter.page - 1) * filter.limit;

    const [docs, total] = await Promise.all([
      AttendanceCheckInModel.find(query)
        .sort({ checkedInAt: -1 })
        .skip(skip)
        .limit(filter.limit)
        .populate('userId', 'firstName lastName email'),
      AttendanceCheckInModel.countDocuments(query),
    ]);

    const checkIns: AttendanceCheckInWithUser[] = docs.map((doc) => {
      const base = toEntity(doc);
      const user = doc.userId as unknown as {
        _id: { toString(): string };
        firstName: string;
        lastName: string;
        email: string;
      };

      return {
        ...base,
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      };
    });

    return {
      checkIns,
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit) || 1,
    };
  }
}

export const attendanceCheckInRepository = new MongoAttendanceCheckInRepository();
