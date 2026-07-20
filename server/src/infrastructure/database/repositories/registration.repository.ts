import { RegistrationNotFoundError } from '../../../domain/errors/registration.errors';
import { Registration, RegistrationWithEvent, RegistrationWithUser } from '../../../domain/entities/registration.entity';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../../../domain/enums/registration.enum';
import {
  CreateRegistrationData,
  IRegistrationRepository,
  ListRegistrationsFilter,
  PaginatedRegistrations,
  PaginatedUserRegistrations,
} from '../../../domain/interfaces/registration.repository.interface';
import { RegistrationModel, RegistrationDocument } from '../models/registration.model';

function toRegistrationEntity(doc: RegistrationDocument): Registration {
  return {
    id: doc._id.toString(),
    collegeId: doc.collegeId.toString(),
    eventId: doc.eventId.toString(),
    clubId: doc.clubId.toString(),
    userId: doc.userId.toString(),
    status: doc.status as RegistrationStatus,
    approvalStatus: doc.approvalStatus as RegistrationApprovalStatus,
    registeredAt: doc.registeredAt,
    cancelledAt: doc.cancelledAt,
    checkedInAt: doc.checkedInAt,
    checkedInBy: doc.checkedInBy?.toString(),
    source: doc.source as RegistrationSource,
    idempotencyKey: doc.idempotencyKey,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoRegistrationRepository implements IRegistrationRepository {
  async findByEventAndUser(eventId: string, userId: string): Promise<Registration | null> {
    const doc = await RegistrationModel.findOne({ eventId, userId });
    return doc ? toRegistrationEntity(doc) : null;
  }

  async findById(collegeId: string, id: string): Promise<Registration | null> {
    const doc = await RegistrationModel.findOne({ _id: id, collegeId });
    return doc ? toRegistrationEntity(doc) : null;
  }

  async findByIdempotencyKey(key: string): Promise<Registration | null> {
    const doc = await RegistrationModel.findOne({ idempotencyKey: key });
    return doc ? toRegistrationEntity(doc) : null;
  }

  async create(data: CreateRegistrationData): Promise<Registration> {
    const doc = await RegistrationModel.create({
      ...data,
      registeredAt: new Date(),
    });
    return toRegistrationEntity(doc);
  }

  async updateStatus(
    collegeId: string,
    id: string,
    update: {
      status: RegistrationStatus;
      cancelledAt?: Date;
      checkedInAt?: Date;
      checkedInBy?: string;
      approvalStatus?: RegistrationApprovalStatus;
    },
  ): Promise<Registration> {
    const doc = await RegistrationModel.findOneAndUpdate(
      { _id: id, collegeId },
      { $set: update },
      { new: true },
    );

    if (!doc) {
      throw new RegistrationNotFoundError();
    }

    return toRegistrationEntity(doc);
  }

  async findOldestWaitlisted(eventId: string): Promise<Registration | null> {
    const doc = await RegistrationModel.findOne({
      eventId,
      status: RegistrationStatus.WAITLISTED,
    }).sort({ registeredAt: 1 });

    return doc ? toRegistrationEntity(doc) : null;
  }

  async listByEvent(filter: ListRegistrationsFilter): Promise<PaginatedRegistrations> {
    const query: Record<string, unknown> = {
      collegeId: filter.collegeId,
      eventId: filter.eventId,
    };

    if (filter.status) {
      query.status = filter.status;
    }

    const skip = (filter.page - 1) * filter.limit;

    let userQuery = RegistrationModel.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ registeredAt: 1 })
      .skip(skip)
      .limit(filter.limit);

    if (filter.search) {
      userQuery = RegistrationModel.find(query)
        .populate({
          path: 'userId',
          match: {
            $or: [
              { firstName: { $regex: filter.search, $options: 'i' } },
              { lastName: { $regex: filter.search, $options: 'i' } },
              { email: { $regex: filter.search, $options: 'i' } },
            ],
          },
          select: 'firstName lastName email',
        })
        .sort({ registeredAt: 1 })
        .skip(skip)
        .limit(filter.limit);
    }

    const [docs, total] = await Promise.all([
      userQuery,
      RegistrationModel.countDocuments(query),
    ]);

    const registrations: RegistrationWithUser[] = docs
      .filter((doc) => doc.userId && typeof doc.userId === 'object')
      .map((doc) => {
        const user = doc.userId as unknown as {
          _id: { toString(): string };
          firstName: string;
          lastName: string;
          email: string;
        };
        return {
          ...toRegistrationEntity(doc),
          user: {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        };
      });

    return {
      registrations,
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    };
  }

  async listByUser(
    collegeId: string,
    userId: string,
    options: { status?: RegistrationStatus; page: number; limit: number },
  ): Promise<PaginatedUserRegistrations> {
    const query: Record<string, unknown> = { collegeId, userId };

    if (options.status) {
      query.status = options.status;
    } else {
      query.status = { $in: [RegistrationStatus.REGISTERED, RegistrationStatus.WAITLISTED, RegistrationStatus.ATTENDED] };
    }

    const skip = (options.page - 1) * options.limit;

    const [docs, total] = await Promise.all([
      RegistrationModel.find(query)
        .populate({ path: 'eventId', select: 'title slug startAt endAt clubId' })
        .populate({ path: 'clubId', select: 'name slug' })
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(options.limit),
      RegistrationModel.countDocuments(query),
    ]);

    const registrations: RegistrationWithEvent[] = docs
      .filter((doc) => doc.eventId && typeof doc.eventId === 'object')
      .map((doc) => {
        const event = doc.eventId as unknown as {
          _id: { toString(): string };
          title: string;
          slug: string;
          startAt: Date;
          endAt: Date;
        };
        const club = doc.clubId as unknown as { name?: string; slug?: string };

        return {
          ...toRegistrationEntity(doc),
          event: {
            id: event._id.toString(),
            title: event.title,
            slug: event.slug,
            startAt: event.startAt,
            endAt: event.endAt,
            clubId: doc.clubId.toString(),
            clubName: club?.name,
            clubSlug: club?.slug,
          },
        };
      });

    return {
      registrations,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }
}

export const registrationRepository = new MongoRegistrationRepository();
