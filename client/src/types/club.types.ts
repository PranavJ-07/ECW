export type ClubCategory = 'tech' | 'cultural' | 'sports' | 'literary' | 'social' | 'other';
export type ClubStatus = 'draft' | 'active' | 'archived' | 'suspended';
export type MembershipRole = 'member' | 'officer' | 'president' | 'treasurer';

export interface ClubSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: ClubCategory;
  logoUrl?: string;
  memberCount: number;
  status: ClubStatus;
  createdAt: string;
}

export interface UserClubMembership {
  clubId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  memberCount: number;
  role: MembershipRole;
  status: string;
}

export interface ClubDetail extends ClubSummary {
  collegeId: string;
  tags: string[];
  officerCount: number;
  contactEmail?: string;
  visibility: string;
  myMembership?: {
    role: MembershipRole;
    status: string;
  } | null;
}
