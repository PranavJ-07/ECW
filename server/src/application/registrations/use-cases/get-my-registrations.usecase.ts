import {
  IRegistrationRepository,
  PaginatedUserRegistrations,
} from '../../../domain/interfaces/registration.repository.interface';
import { RegistrationStatus } from '../../../domain/enums/registration.enum';

export interface GetMyRegistrationsInput {
  collegeId: string;
  userId: string;
  status?: RegistrationStatus;
  page?: number;
  limit?: number;
}

/**
 * Returns the authenticated user's event registrations.
 */
export class GetMyRegistrationsUseCase {
  constructor(private readonly registrationRepository: IRegistrationRepository) {}

  async execute(input: GetMyRegistrationsInput): Promise<PaginatedUserRegistrations> {
    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 20, 100);

    return this.registrationRepository.listByUser(input.collegeId, input.userId, {
      status: input.status,
      page,
      limit,
    });
  }
}
