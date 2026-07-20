import { MembershipRole } from '../enums/club.enum';

export interface IMembershipRepository {
  isActiveOfficer(clubId: string, userId: string): Promise<boolean>;
  isActivePresident(clubId: string, userId: string): Promise<boolean>;
  getActiveRole(clubId: string, userId: string): Promise<MembershipRole | null>;
  hasActiveMembership(clubId: string, userId: string): Promise<boolean>;
}
