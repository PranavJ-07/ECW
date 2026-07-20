export enum NotificationType {
  EVENT_CANCELLED = 'event_cancelled',
  EVENT_REMINDER = 'event_reminder',
  REGISTRATION_CONFIRMED = 'registration_confirmed',
  REGISTRATION_WAITLISTED = 'registration_waitlisted',
  MEMBERSHIP_APPROVED = 'membership_approved',
  MEMBERSHIP_REJECTED = 'membership_rejected',
  EXPENSE_APPROVED = 'expense_approved',
  EXPENSE_REJECTED = 'expense_rejected',
  CERTIFICATE_ISSUED = 'certificate_issued',
  ANNOUNCEMENT = 'announcement',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}
