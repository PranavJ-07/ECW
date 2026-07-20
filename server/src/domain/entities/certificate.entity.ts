import { CertificateStatus } from '../enums/certificate.enum';

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
  eventDate: Date;
  clubName?: string;
  issuedAt: Date;
  issuedBy: string;
  fileUrl?: string;
  status: CertificateStatus;
  revokedAt?: Date;
  revokedBy?: string;
  revokeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificateWithUser extends Certificate {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CertificateVerificationView {
  certificateNumber: string;
  recipientName: string;
  eventTitle: string;
  eventDate: Date;
  clubName?: string;
  issuedAt: Date;
  status: CertificateStatus;
  collegeName?: string;
}
