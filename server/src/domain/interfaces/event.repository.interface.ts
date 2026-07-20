import { Event, EventSummary } from '../entities/event.entity';
import { EventLocation } from '../entities/event.entity';
import { EventStatus, EventVisibility } from '../enums/event.enum';

export interface CreateEventData {
  collegeId: string;
  clubId: string;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  location: EventLocation;
  startAt: Date;
  endAt: Date;
  timezone: string;
  capacity?: number;
  registrationOpensAt?: Date;
  registrationClosesAt?: Date;
  requiresApproval?: boolean;
  visibility?: EventVisibility;
  tags?: string[];
  createdBy: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  location?: EventLocation;
  startAt?: Date;
  endAt?: Date;
  timezone?: string;
  capacity?: number;
  registrationOpensAt?: Date;
  registrationClosesAt?: Date;
  requiresApproval?: boolean;
  visibility?: EventVisibility;
  tags?: string[];
}

export interface ListEventsFilter {
  collegeId: string;
  clubId?: string;
  clubSlug?: string;
  status?: EventStatus;
  visibility?: EventVisibility;
  search?: string;
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
  sort: string;
}

export interface PaginatedEvents {
  events: EventSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IEventRepository {
  findBySlug(collegeId: string, slug: string): Promise<Event | null>;
  findById(collegeId: string, id: string): Promise<Event | null>;
  slugExists(collegeId: string, slug: string): Promise<boolean>;
  create(data: CreateEventData): Promise<Event>;
  update(collegeId: string, eventId: string, data: UpdateEventData): Promise<Event>;
  publish(collegeId: string, eventId: string): Promise<Event>;
  cancel(collegeId: string, eventId: string, reason?: string): Promise<Event>;
  softDelete(collegeId: string, eventId: string): Promise<void>;
  list(filter: ListEventsFilter): Promise<PaginatedEvents>;
  /** Atomically reserve a registration slot; returns waitlisted if at capacity */
  reserveRegistrationSlot(collegeId: string, eventId: string): Promise<'registered' | 'waitlisted'>;
  /** Release a slot on cancellation */
  releaseRegistrationSlot(
    collegeId: string,
    eventId: string,
    wasRegistered: boolean,
  ): Promise<void>;
  /** Move one waitlist slot to registered when a registered spot opens */
  promoteWaitlistSlot(collegeId: string, eventId: string): Promise<void>;
}
