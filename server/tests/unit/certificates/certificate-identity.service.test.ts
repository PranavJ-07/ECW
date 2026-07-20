import { describe, it, expect } from 'vitest';
import { CertificateIdentityService } from '../../../src/application/certificates/services/certificate-identity.service';

describe('CertificateIdentityService', () => {
  const service = new CertificateIdentityService();

  it('generates unique certificate numbers with EC prefix', () => {
    const number = service.generateCertificateNumber();
    expect(number).toMatch(/^EC-\d{4}-[A-F0-9]{8}$/);
  });

  it('generates URL-safe verification codes', () => {
    const code = service.generateVerificationCode();
    expect(code.length).toBeGreaterThan(20);
    expect(code).not.toMatch(/[+/=]/);
  });
});
