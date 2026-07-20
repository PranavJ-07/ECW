import { Event, EventSummary } from '../../../domain/entities/event.entity';
import { EventStatus, EventVisibility } from '../../../domain/enums/event.enum';
import { EventNotFoundError } from '../../../domain/errors/event.errors';
import {
  CreateEventData,
  IEventRepository,
  ListEventsFilter,
  PaginatedEvents,
  UpdateEventData,
} from '../../../domain/interfaces/event.repository.interface';
import { EventModel, EventDocument } from '../models/event.model';

function toEventEntity(doc: EventDocument): Event {
  return {
    id: doc._id.toString(),
    collegeId: doc.collegeId.toString(),
    clubId: doc.clubId.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    coverImageUrl: doc.coverImageUrl,
    location: doc.location,
    startAt: doc.startAt,
    endAt: doc.endAt,
    timezone: doc.timezone,
    capacity: doc.capacity,
    registrationCount: doc.registrationCount,
    waitlistCount: doc.waitlistCount,
    registrationOpensAt: doc.registrationOpensAt,
    registrationClosesAt: doc.registrationClosesAt,
    requiresApproval: doc.requiresApproval,
    status: doc.status as EventStatus,
    visibility: doc.visibility as EventVisibility,
    tags: doc.tags,
    createdBy: doc.createdBy.toString(),
    publishedAt: doc.publishedAt,
    cancelledAt: doc.cancelledAt,
    cancelReason: doc.cancelReason,
    isDeleted: doc.isDeleted,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toEventSummary(doc: EventDocument): EventSummary {
  const populated = doc.populated('clubId');
  let clubIdStr = doc.clubId.toString();
  let clubSlug: string | undefined;
  let clubName: string | undefined;

  if (populated && typeof doc.clubId === 'object' && doc.clubId !== null && 'slug' in doc.clubId) {
    const club = doc.clubId as unknown as { _id: { toString(): string }; slug: string; name: string };
    clubIdStr = club._id.toString();
    clubSlug = club.slug;
    clubName = club.name;
  }

  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    clubId: clubIdStr,
    clubSlug,
    clubName,
    coverImageUrl: doc.coverImageUrl,
    startAt: doc.startAt,
    endAt: doc.endAt,
    location: doc.location,
    capacity: doc.capacity,
    registrationCount: doc.registrationCount,
    status: doc.status as EventStatus,
    visibility: doc.visibility as EventVisibility,
    createdAt: doc.createdAt,
  };
}

export class MongoEventRepository implements IEventRepository {
  async findBySlug(collegeId: string, slug: string): Promise<Event | null> {
    const doc = await EventModel.findOne({
      collegeId,
      slug: slug.toLowerCase().trim(),
      isDeleted: false,
    });
    return doc ? toEventEntity(doc) : null;
  }

  async findById(collegeId: string, id: string): Promise<Event | null> {
    const doc = await EventModel.findOne({ _id: id, collegeId, isDeleted: false });
    return doc ? toEventEntity(doc) : null;
  }

  async slugExists(collegeId: string, slug: string): Promise<boolean> {
    const count = await EventModel.countDocuments({
      collegeId,
      slug: slug.toLowerCase().trim(),
      isDeleted: false,
    });
    return count > 0;
  }

  async create(data: CreateEventData): Promise<Event> {
    const doc = await EventModel.create({
      ...data,
      status: EventStatus.DRAFT,
    });
    return toEventEntity(doc);
  }

  async update(collegeId: string, eventId: string, data: UpdateEventData): Promise<Event> {
    const doc = await EventModel.findOneAndUpdate(
      { _id: eventId, collegeId, isDeleted: false },
      { $set: data },
      { new: true },
    );

    if (!doc) {
      throw new EventNotFoundError();
    }

    return toEventEntity(doc);
  }

  async publish(collegeId: string, eventId: string): Promise<Event> {
    const doc = await EventModel.findOneAndUpdate(
      { _id: eventId, collegeId, isDeleted: false, status: EventStatus.DRAFT },
      { $set: { status: EventStatus.PUBLISHED, publishedAt: new Date() } },
      { new: true },
    );

    if (!doc) {
      throw new EventNotFoundError();
    }

    return toEventEntity(doc);
  }

  async cancel(collegeId: string, eventId: string, reason?: string): Promise<Event> {
    const doc = await EventModel.findOneAndUpdate(
      { _id: eventId, collegeId, isDeleted: false },
      {
        $set: {
          status: EventStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason,
        },
      },
      { new: true },
    );

    if (!doc) {
      throw new EventNotFoundError();
    }

    return toEventEntity(doc);
  }

  async softDelete(collegeId: string, eventId: string): Promise<void> {
    const result = await EventModel.updateOne(
      { _id: eventId, collegeId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      throw new EventNotFoundError();
    }
  }

  async list(filter: ListEventsFilter): Promise<PaginatedEvents> {
    const query: Record<string, unknown> = {
      collegeId: filter.collegeId,
      isDeleted: false,
    };

    if (filter.clubId) {
      query.clubId = filter.clubId;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.visibility) {
      query.visibility = filter.visibility;
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    if (filter.from || filter.to) {
      query.startAt = {};
      if (filter.from) {
        (query.startAt as Record<string, Date>).$gte = filter.from;
      }
      if (filter.to) {
        (query.startAt as Record<string, Date>).$lte = filter.to;
      }
    }

    const sortField = filter.sort.startsWith('-') ? filter.sort.slice(1) : filter.sort;
    const sortOrder = filter.sort.startsWith('-') ? -1 : 1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder as 1 | -1 };

    const skip = (filter.page - 1) * filter.limit;

    const [docs, total] = await Promise.all([
      EventModel.find(query)
        .populate('clubId', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(filter.limit),
      EventModel.countDocuments(query),
    ]);

    return {
      events: docs.map((doc) => toEventSummary(doc)),
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    };
  }

  async reserveRegistrationSlot(
    collegeId: string,
    eventId: string,
  ): Promise<'registered' | 'waitlisted'> {
    const event = await EventModel.findOne({ _id: eventId, collegeId, isDeleted: false });

    if (!event) {
      throw new EventNotFoundError();
    }

    if (event.capacity == null) {
      await EventModel.updateOne({ _id: eventId }, { $inc: { registrationCount: 1 } });
      return 'registered';
    }

    const updated = await EventModel.findOneAndUpdate(
      {
        _id: eventId,
        collegeId,
        isDeleted: false,
        $expr: { $lt: ['$registrationCount', '$capacity'] },
      },
      { $inc: { registrationCount: 1 } },
      { new: true },
    );

    if (updated) {
      return 'registered';
    }

    await EventModel.updateOne({ _id: eventId }, { $inc: { waitlistCount: 1 } });
    return 'waitlisted';
  }

  async releaseRegistrationSlot(
    collegeId: string,
    eventId: string,
    wasRegistered: boolean,
  ): Promise<void> {
    const field = wasRegistered ? 'registrationCount' : 'waitlistCount';
    await EventModel.updateOne(
      { _id: eventId, collegeId, isDeleted: false, [field]: { $gt: 0 } },
      { $inc: { [field]: -1 } },
    );
  }

  async promoteWaitlistSlot(collegeId: string, eventId: string): Promise<void> {
    await EventModel.updateOne(
      { _id: eventId, collegeId, isDeleted: false, waitlistCount: { $gt: 0 } },
      { $inc: { registrationCount: 1, waitlistCount: -1 } },
    );
  }
}

export const eventRepository = new MongoEventRepository();
