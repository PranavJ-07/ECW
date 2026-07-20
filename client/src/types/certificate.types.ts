export type CertificateStatus = 'issued' | 'revoked';

export interface Certificate {
  id: string;
  collegeId: string;
  eventId: string;
  clubId: string;
  userId: string;
  registrationId: string;
  certificateNumber: string;
  verificationCode: string;
  recipientName: string;
  eventTitle: string;
  eventDate: string;
  clubName?: string;
  issuedAt: string;
  fileUrl?: string;
  status: CertificateStatus;
}

export interface ListMyCertificatesParams {
  page?: number;
  limit?: number;
  status?: CertificateStatus;
}
