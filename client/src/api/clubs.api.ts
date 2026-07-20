import { apiClient } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api.types';
import type { ClubCategory, ClubDetail, ClubSummary, UserClubMembership } from '@/types/club.types';
import type { PaginationMeta } from '@/types/pagination.types';
import { extractPaginated } from '@/types/pagination.types';

function collegePath(collegeSlug: string): string {
  return `/colleges/${collegeSlug}`;
}

export async function getMyOfficerClubs(collegeSlug: string): Promise<UserClubMembership[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<UserClubMembership[]>>(
    `${collegePath(collegeSlug)}/users/me/clubs`,
  );
  return data.data;
}

export async function getMyAdvisedClubs(collegeSlug: string): Promise<ClubSummary[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ClubSummary[]>>(
    `${collegePath(collegeSlug)}/users/me/advised-clubs`,
  );
  return data.data;
}

export async function listClubs(
  collegeSlug: string,
  params?: { page?: number; limit?: number; search?: string },
) {
  const { data } = await apiClient.get<ApiSuccessResponse<ClubSummary[]>>(
    `${collegePath(collegeSlug)}/clubs`,
    { params },
  );
  return extractPaginated(data.data, data.meta as PaginationMeta | undefined);
}

export async function getClub(collegeSlug: string, clubSlug: string): Promise<ClubDetail> {
  const { data } = await apiClient.get<ApiSuccessResponse<ClubDetail>>(
    `${collegePath(collegeSlug)}/clubs/${clubSlug}`,
  );
  return data.data;
}

export interface CreateClubPayload {
  name: string;
  slug: string;
  description?: string;
  category: ClubCategory;
  contactEmail?: string;
  facultyAdvisorId?: string;
  visibility?: 'college_only' | 'public';
}

export async function createClub(collegeSlug: string, payload: CreateClubPayload) {
  const { data } = await apiClient.post(`${collegePath(collegeSlug)}/clubs`, payload);
  return data.data;
}
