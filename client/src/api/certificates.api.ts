import { apiClient } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api.types';
import type { Certificate, ListMyCertificatesParams } from '@/types/certificate.types';
import type { PaginationMeta } from '@/types/pagination.types';
import { extractPaginated } from '@/types/pagination.types';

function mePath(collegeSlug: string): string {
  return `/colleges/${collegeSlug}/users/me`;
}

export async function listMyCertificates(
  collegeSlug: string,
  params?: ListMyCertificatesParams,
) {
  const { data } = await apiClient.get<ApiSuccessResponse<Certificate[]>>(
    `${mePath(collegeSlug)}/certificates`,
    { params },
  );

  return extractPaginated(data.data, data.meta as PaginationMeta | undefined);
}

export async function getMyCertificate(collegeSlug: string, certificateId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<Certificate>>(
    `${mePath(collegeSlug)}/certificates/${certificateId}`,
  );
  return data.data;
}
