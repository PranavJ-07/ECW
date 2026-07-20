import { MembershipRole, MembershipStatus } from '../enums/club.enum';

export interface UserClubMembership {
  clubId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  memberCount: number;
  role: MembershipRole;
  status: MembershipStatus;
}
