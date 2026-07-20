import { randomBytes } from 'crypto';

/**
 * Generates human-readable certificate numbers and URL-safe verification codes.
 */
export class CertificateIdentityService {
  generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const suffix = randomBytes(4).toString('hex').toUpperCase();
    return `EC-${year}-${suffix}`;
  }

  generateVerificationCode(): string {
    return randomBytes(24).toString('base64url');
  }
}

export const certificateIdentityService = new CertificateIdentityService();
