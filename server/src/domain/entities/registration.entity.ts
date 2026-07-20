import {
  RegistrationApprovalStatus,
  RegistrationSource,
  RegistrationStatus,
} from '../enums/registration.enum';

export interface Registration {
  id: string;
  collegeId: string;
  eventId: string;
  clubId: string;
  userId: string;
  status: RegistrationStatus;
  approvalStatus: RegistrationApprovalStatus;
  registeredAt: Date;
  cancelledAt?: Date;
  checkedInAt?: Date;
  checkedInBy?: string;
  source: RegistrationSource;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationWithUser extends Registration {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface RegistrationWithEvent extends Registration {
  event: {
    id: string;
    title: string;
    slug: string;
    startAt: Date;
    endAt: Date;
    clubId: string;
    clubName?: string;
    clubSlug?: string;
  };
}
