import { apiClient } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api.types';
import type { EventDetail, EventSummary, ListEventsParams } from '@/types/event.types';
import type { PaginationMeta } from '@/types/pagination.types';
import { extractPaginated } from '@/types/pagination.types';

function collegePath(collegeSlug: string): string {
  return `/colleges/${collegeSlug}`;
}

export async function listEvents(collegeSlug: string, params?: ListEventsParams) {
  const { data } = await apiClient.get<ApiSuccessResponse<EventSummary[]>>(
    `${collegePath(collegeSlug)}/events`,
    { params },
  );

  return extractPaginated(data.data, data.meta as PaginationMeta | undefined);
}

export async function getEvent(collegeSlug: string, eventSlug: string): Promise<EventDetail> {
  const { data } = await apiClient.get<ApiSuccessResponse<EventDetail>>(
    `${collegePath(collegeSlug)}/events/${eventSlug}`,
  );
  return data.data;
}

export async function registerForEvent(
  collegeSlug: string,
  eventSlug: string,
  idempotencyKey?: string,
) {
  const { data } = await apiClient.post(`${collegePath(collegeSlug)}/events/${eventSlug}/register`, {
    idempotencyKey,
  });
  return data.data;
}

export async function cancelRegistration(collegeSlug: string, eventSlug: string) {
  const { data } = await apiClient.delete(
    `${collegePath(collegeSlug)}/events/${eventSlug}/register`,
  );
  return data.data;
}

export interface CreateEventPayload {
  title: string;
  slug: string;
  description?: string;
  location: {
    mode: 'onsite' | 'online' | 'hybrid';
    venueName?: string;
    address?: string;
    meetingUrl?: string;
  };
  startAt: string;
  endAt: string;
  timezone: string;
  capacity?: number;
  requiresApproval?: boolean;
  visibility?: 'public' | 'college_only' | 'members_only';
  tags?: string[];
}

export async function createClubEvent(
  collegeSlug: string,
  clubSlug: string,
  payload: CreateEventPayload,
) {
  const { data } = await apiClient.post(
    `${collegePath(collegeSlug)}/clubs/${clubSlug}/events`,
    payload,
  );
  return data.data;
}

export async function publishEvent(collegeSlug: string, eventSlug: string) {
  const { data } = await apiClient.post(`${collegePath(collegeSlug)}/events/${eventSlug}/publish`);
  return data.data;
}

export async function cancelEvent(collegeSlug: string, eventSlug: string, reason?: string) {
  const { data } = await apiClient.post(`${collegePath(collegeSlug)}/events/${eventSlug}/cancel`, {
    reason,
  });
  return data.data;
}
