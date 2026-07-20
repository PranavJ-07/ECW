import { EventStatus } from '../../../domain/enums/event.enum';
import { IEventRepository, PaginatedEvents } from '../../../domain/interfaces/event.repository.interface';
import { IClubRepository } from '../../../domain/interfaces/club.repository.interface';

export interface ListEventsInput {
  collegeId: string;
  clubSlug?: string;
  status?: EventStatus;
  visibility?: import('../../../domain/enums/event.enum').EventVisibility;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Returns paginated events for a college with optional club and date filters.
 */
export class ListEventsUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(input: ListEventsInput): Promise<PaginatedEvents> {
    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 20, 100);

    let clubId: string | undefined;

    if (input.clubSlug) {
      const club = await this.clubRepository.findBySlug(input.collegeId, input.clubSlug);
      clubId = club?.id;
    }

    return this.eventRepository.list({
      collegeId: input.collegeId,
      clubId,
      clubSlug: input.clubSlug,
      status: input.status ?? EventStatus.PUBLISHED,
      visibility: input.visibility,
      search: input.search?.trim(),
      from: input.from ? new Date(input.from) : undefined,
      to: input.to ? new Date(input.to) : undefined,
      page,
      limit,
      sort: input.sort ?? 'startAt',
    });
  }
}
