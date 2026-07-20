import { MembershipRole, MembershipStatus } from '../../../domain/enums/club.enum';
import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';
import { MembershipModel } from '../models/membership.model';

const OFFICER_ROLES = [MembershipRole.OFFICER, MembershipRole.PRESIDENT, MembershipRole.TREASURER];

export class MongoMembershipRepository implements IMembershipRepository {
  async isActiveOfficer(clubId: string, userId: string): Promise<boolean> {
    const doc = await MembershipModel.findOne({
      clubId,
      userId,
      status: MembershipStatus.ACTIVE,
      role: { $in: OFFICER_ROLES },
    });
    return doc !== null;
  }

  async isActivePresident(clubId: string, userId: string): Promise<boolean> {
    const doc = await MembershipModel.findOne({
      clubId,
      userId,
      status: MembershipStatus.ACTIVE,
      role: MembershipRole.PRESIDENT,
    });
    return doc !== null;
  }

  async getActiveRole(clubId: string, userId: string): Promise<MembershipRole | null> {
    const doc = await MembershipModel.findOne({
      clubId,
      userId,
      status: MembershipStatus.ACTIVE,
    });
    return doc ? (doc.role as MembershipRole) : null;
  }

  async hasActiveMembership(clubId: string, userId: string): Promise<boolean> {
    const doc = await MembershipModel.findOne({
      clubId,
      userId,
      status: MembershipStatus.ACTIVE,
    });
    return doc !== null;
  }
}

export const membershipRepository = new MongoMembershipRepository();
