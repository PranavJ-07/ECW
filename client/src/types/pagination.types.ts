export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T;
  meta: PaginationMeta;
}

export function extractPaginated<T>(
  data: T,
  meta: PaginationMeta | undefined,
): PaginatedResult<T> {
  return {
    items: data,
    meta: meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}
