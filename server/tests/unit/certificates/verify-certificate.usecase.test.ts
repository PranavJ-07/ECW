import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VerifyCertificateUseCase } from '../../../src/application/certificates/use-cases/verify-certificate.usecase';
import { CertificateRevokedError, CertificateNotFoundError } from '../../../src/domain/errors/certificate.errors';
import { CertificateStatus } from '../../../src/domain/enums/certificate.enum';
import { ICertificateRepository } from '../../../src/domain/interfaces/certificate.repository.interface';

function mockCertRepo(): ICertificateRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByEventAndUser: vi.fn(),
    findByVerificationCode: vi.fn(),
    getVerificationView: vi.fn(),
    listByEvent: vi.fn(),
    listByUser: vi.fn(),
    revoke: vi.fn(),
  };
}

describe('VerifyCertificateUseCase', () => {
  let repository: ICertificateRepository;
  let useCase: VerifyCertificateUseCase;

  beforeEach(() => {
    repository = mockCertRepo();
    useCase = new VerifyCertificateUseCase(repository);
  });

  it('returns verification view for valid code', async () => {
    vi.mocked(repository.getVerificationView).mockResolvedValue({
      certificateNumber: 'EC-2026-ABCD1234',
      recipientName: 'Jane Doe',
      eventTitle: 'Workshop',
      eventDate: new Date(),
      issuedAt: new Date(),
      status: CertificateStatus.ISSUED,
      collegeName: 'MIT',
    });

    const result = await useCase.execute('valid-code');

    expect(result.recipientName).toBe('Jane Doe');
    expect(result.status).toBe(CertificateStatus.ISSUED);
  });

  it('throws when verification code not found', async () => {
    vi.mocked(repository.getVerificationView).mockResolvedValue(null);

    await expect(useCase.execute('invalid')).rejects.toThrow(CertificateNotFoundError);
  });

  it('throws when certificate is revoked', async () => {
    vi.mocked(repository.getVerificationView).mockResolvedValue({
      certificateNumber: 'EC-2026-ABCD1234',
      recipientName: 'Jane Doe',
      eventTitle: 'Workshop',
      eventDate: new Date(),
      issuedAt: new Date(),
      status: CertificateStatus.REVOKED,
    });

    await expect(useCase.execute('revoked-code')).rejects.toThrow(CertificateRevokedError);
  });
});
