import { MembershipRole } from '../enums/club.enum';
import { UserClubMembership } from '../entities/membership.entity';

export interface IMembershipRepository {
  isActiveOfficer(clubId: string, userId: string): Promise<boolean>;
  isActivePresident(clubId: string, userId: string): Promise<boolean>;
  getActiveRole(clubId: string, userId: string): Promise<MembershipRole | null>;
  hasActiveMembership(clubId: string, userId: string): Promise<boolean>;
  listOfficerClubsByUser(collegeId: string, userId: string): Promise<UserClubMembership[]>;
}
