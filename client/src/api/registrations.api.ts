import { apiClient } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api.types';
import type { PaginationMeta } from '@/types/pagination.types';
import { extractPaginated } from '@/types/pagination.types';
import type {
  ListMyRegistrationsParams,
  RegistrationStatus,
  RegistrationWithEvent,
} from '@/types/registration.types';

export interface RegistrationWithUser {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

function mePath(collegeSlug: string): string {
  return `/colleges/${collegeSlug}/users/me`;
}

function collegePath(collegeSlug: string): string {
  return `/colleges/${collegeSlug}`;
}

export async function listMyRegistrations(
  collegeSlug: string,
  params?: ListMyRegistrationsParams,
) {
  const { data } = await apiClient.get<ApiSuccessResponse<RegistrationWithEvent[]>>(
    `${mePath(collegeSlug)}/registrations`,
    { params },
  );

  return extractPaginated(data.data, data.meta as PaginationMeta | undefined);
}

export async function listEventRegistrations(
  collegeSlug: string,
  eventSlug: string,
  params?: { page?: number; limit?: number; status?: RegistrationStatus; search?: string },
) {
  const { data } = await apiClient.get<ApiSuccessResponse<RegistrationWithUser[]>>(
    `${collegePath(collegeSlug)}/events/${eventSlug}/registrations`,
    { params },
  );

  return extractPaginated(data.data, data.meta as PaginationMeta | undefined);
}
