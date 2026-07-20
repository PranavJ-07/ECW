import { EventLocationMode, EventStatus, EventVisibility } from '../enums/event.enum';

export interface EventLocation {
  mode: EventLocationMode;
  venueName?: string;
  address?: string;
  meetingUrl?: string;
}

export interface Event {
  id: string;
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
  registrationCount: number;
  waitlistCount: number;
  registrationOpensAt?: Date;
  registrationClosesAt?: Date;
  requiresApproval: boolean;
  status: EventStatus;
  visibility: EventVisibility;
  tags: string[];
  createdBy: string;
  publishedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventSummary {
  id: string;
  title: string;
  slug: string;
  clubId: string;
  clubSlug?: string;
  clubName?: string;
  coverImageUrl?: string;
  startAt: Date;
  endAt: Date;
  location: EventLocation;
  capacity?: number;
  registrationCount: number;
  status: EventStatus;
  visibility: EventVisibility;
  createdAt: Date;
}

export interface EventClubContext {
  id: string;
  name: string;
  slug: string;
}
