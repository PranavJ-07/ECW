export type RegistrationStatus =
  | 'registered'
  | 'waitlisted'
  | 'cancelled'
  | 'attended'
  | 'no_show';

export type RegistrationApprovalStatus =
  | 'not_required'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface RegistrationWithEvent {
  id: string;
  collegeId: string;
  eventId: string;
  clubId: string;
  userId: string;
  status: RegistrationStatus;
  approvalStatus: RegistrationApprovalStatus;
  registeredAt: string;
  cancelledAt?: string;
  checkedInAt?: string;
  event: {
    id: string;
    title: string;
    slug: string;
    startAt: string;
    endAt: string;
    clubId: string;
    clubName?: string;
    clubSlug?: string;
  };
}

export interface ListMyRegistrationsParams {
  page?: number;
  limit?: number;
  status?: RegistrationStatus;
}
