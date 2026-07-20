import { apiClient } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api.types';
import type { ClubAnalytics, CollegeOverviewAnalytics, EventAnalytics } from '@/types/analytics.types';

function collegePath(collegeSlug: string): string {
  return `/colleges/${collegeSlug}`;
}

export async function getCollegeOverview(
  collegeSlug: string,
  params?: { from?: string; to?: string },
): Promise<CollegeOverviewAnalytics> {
  const { data } = await apiClient.get<ApiSuccessResponse<CollegeOverviewAnalytics>>(
    `${collegePath(collegeSlug)}/analytics/overview`,
    { params },
  );
  return data.data;
}

export async function getClubAnalytics(
  collegeSlug: string,
  clubSlug: string,
): Promise<ClubAnalytics> {
  const { data } = await apiClient.get<ApiSuccessResponse<ClubAnalytics>>(
    `${collegePath(collegeSlug)}/clubs/${clubSlug}/analytics`,
  );
  return data.data;
}

export async function getEventAnalytics(
  collegeSlug: string,
  eventSlug: string,
): Promise<EventAnalytics> {
  const { data } = await apiClient.get<ApiSuccessResponse<EventAnalytics>>(
    `${collegePath(collegeSlug)}/events/${eventSlug}/analytics`,
  );
  return data.data;
}
