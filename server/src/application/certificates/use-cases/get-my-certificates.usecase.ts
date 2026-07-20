import { CertificateStatus } from '../../../domain/enums/certificate.enum';
import {
  ICertificateRepository,
  PaginatedUserCertificates,
} from '../../../domain/interfaces/certificate.repository.interface';

export interface GetMyCertificatesInput {
  collegeId: string;
  userId: string;
  status?: CertificateStatus;
  page?: number;
  limit?: number;
}

/**
 * Returns certificates belonging to the authenticated user.
 */
export class GetMyCertificatesUseCase {
  constructor(private readonly certificateRepository: ICertificateRepository) {}

  async execute(input: GetMyCertificatesInput): Promise<PaginatedUserCertificates> {
    const page = input.page ?? 1;
    const limit = Math.min(input.limit ?? 20, 100);

    return this.certificateRepository.listByUser({
      collegeId: input.collegeId,
      userId: input.userId,
      status: input.status,
      page,
      limit,
    });
  }
}
