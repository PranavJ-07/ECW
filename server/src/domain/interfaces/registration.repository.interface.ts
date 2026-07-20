import {
  Registration,
  RegistrationWithEvent,
  RegistrationWithUser,
} from '../entities/registration.entity';
import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../enums/registration.enum';

export interface CreateRegistrationData {
  collegeId: string;
  eventId: string;
  clubId: string;
  userId: string;
  status: RegistrationStatus;
  approvalStatus: RegistrationApprovalStatus;
  source?: RegistrationSource;
  idempotencyKey?: string;
}

export interface ListRegistrationsFilter {
  collegeId: string;
  eventId: string;
  status?: RegistrationStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedRegistrations {
  registrations: RegistrationWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUserRegistrations {
  registrations: RegistrationWithEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IRegistrationRepository {
  findByEventAndUser(eventId: string, userId: string): Promise<Registration | null>;
  findById(collegeId: string, id: string): Promise<Registration | null>;
  findByIdempotencyKey(key: string): Promise<Registration | null>;
  create(data: CreateRegistrationData): Promise<Registration>;
  updateStatus(
    collegeId: string,
    id: string,
    update: {
      status: RegistrationStatus;
      cancelledAt?: Date;
      checkedInAt?: Date;
      checkedInBy?: string;
      approvalStatus?: RegistrationApprovalStatus;
    },
  ): Promise<Registration>;
  listByEvent(filter: ListRegistrationsFilter): Promise<PaginatedRegistrations>;
  listByUser(
    collegeId: string,
    userId: string,
    options: { status?: RegistrationStatus; page: number; limit: number },
  ): Promise<PaginatedUserRegistrations>;
  findOldestWaitlisted(eventId: string): Promise<Registration | null>;
}
