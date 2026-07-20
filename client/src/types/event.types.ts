export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type EventVisibility = 'public' | 'college_only' | 'members_only';
export type EventLocationMode = 'onsite' | 'online' | 'hybrid';

export interface EventLocation {
  mode: EventLocationMode;
  venueName?: string;
  address?: string;
  meetingUrl?: string;
}

export interface EventSummary {
  id: string;
  title: string;
  slug: string;
  clubId: string;
  clubSlug?: string;
  clubName?: string;
  coverImageUrl?: string;
  startAt: string;
  endAt: string;
  location: EventLocation;
  capacity?: number;
  registrationCount: number;
  status: EventStatus;
  visibility: EventVisibility;
  createdAt: string;
}

export interface EventDetail extends EventSummary {
  collegeId: string;
  description?: string;
  timezone: string;
  waitlistCount: number;
  requiresApproval: boolean;
  tags: string[];
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  publishedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface ListEventsParams {
  page?: number;
  limit?: number;
  clubSlug?: string;
  status?: EventStatus;
  search?: string;
  from?: string;
  to?: string;
}
