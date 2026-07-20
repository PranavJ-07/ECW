export interface TrendPoint {
  period: string;
  count: number;
}

export interface ClubRankingEntry {
  clubId: string;
  name: string;
  slug: string;
  memberCount: number;
  eventCount: number;
}

export interface CollegeOverviewAnalytics {
  collegeId: string;
  generatedAt: string;
  clubs: {
    total: number;
    active: number;
  };
  events: {
    total: number;
    published: number;
    upcoming: number;
    cancelled: number;
  };
  registrations: {
    total: number;
    attended: number;
    attendanceRate: number;
  };
  memberships: {
    active: number;
  };
  certificates: {
    issued: number;
  };
  topClubs: ClubRankingEntry[];
  registrationTrend: TrendPoint[];
}

export interface ClubAnalytics {
  collegeId: string;
  clubId: string;
  clubName: string;
  clubSlug: string;
  generatedAt: string;
  members: {
    total: number;
    officers: number;
  };
  events: {
    total: number;
    published: number;
    upcoming: number;
    cancelled: number;
  };
  registrations: {
    total: number;
    attended: number;
    attendanceRate: number;
  };
  budget: {
    totalAllocatedCents: number;
    totalSpentCents: number;
    utilizationRate: number;
  };
  certificates: {
    issued: number;
  };
}

export interface EventAnalytics {
  collegeId: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  clubId: string;
  generatedAt: string;
  capacity?: number;
  registrationCount: number;
  waitlistCount: number;
  fillRate: number;
  attendance: {
    registered: number;
    attended: number;
    cancelled: number;
    waitlisted: number;
    noShow: number;
    attendanceRate: number;
  };
  checkIns: {
    total: number;
    qrScan: number;
    manual: number;
  };
  certificates: {
    issued: number;
  };
}
