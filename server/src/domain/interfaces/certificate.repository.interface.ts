import {
  Certificate,
  CertificateVerificationView,
  CertificateWithUser,
} from '../entities/certificate.entity';
import { CertificateStatus } from '../enums/certificate.enum';

export interface CreateCertificateData {
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
  issuedBy: string;
  fileUrl?: string;
}

export interface ListEventCertificatesFilter {
  collegeId: string;
  eventId: string;
  status?: CertificateStatus;
  page: number;
  limit: number;
}

export interface ListUserCertificatesFilter {
  collegeId: string;
  userId: string;
  status?: CertificateStatus;
  page: number;
  limit: number;
}

export interface PaginatedCertificates {
  certificates: CertificateWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUserCertificates {
  certificates: Certificate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICertificateRepository {
  create(data: CreateCertificateData): Promise<Certificate>;
  findById(collegeId: string, id: string): Promise<Certificate | null>;
  findByEventAndUser(eventId: string, userId: string): Promise<Certificate | null>;
  findByVerificationCode(code: string): Promise<Certificate | null>;
  getVerificationView(code: string): Promise<CertificateVerificationView | null>;
  listByEvent(filter: ListEventCertificatesFilter): Promise<PaginatedCertificates>;
  listByUser(filter: ListUserCertificatesFilter): Promise<PaginatedUserCertificates>;
  revoke(
    collegeId: string,
    id: string,
    update: { revokedBy: string; revokeReason?: string },
  ): Promise<Certificate>;
}
