import {
  CertificateNotFoundError,
  CertificateRevokedError,
} from '../../../domain/errors/certificate.errors';
import { CertificateVerificationView } from '../../../domain/entities/certificate.entity';
import { CertificateStatus } from '../../../domain/enums/certificate.enum';
import { ICertificateRepository } from '../../../domain/interfaces/certificate.repository.interface';

/**
 * Public certificate verification by unique verification code.
 */
export class VerifyCertificateUseCase {
  constructor(private readonly certificateRepository: ICertificateRepository) {}

  async execute(verificationCode: string): Promise<CertificateVerificationView> {
    const view = await this.certificateRepository.getVerificationView(verificationCode);

    if (!view) {
      throw new CertificateNotFoundError('Certificate not found or invalid verification code');
    }

    if (view.status === CertificateStatus.REVOKED) {
      throw new CertificateRevokedError();
    }

    return view;
  }
}
