import mongoose from 'mongoose';
import { MembershipRole, MembershipStatus } from '../../../domain/enums/club.enum';
import { UserClubMembership } from '../../../domain/entities/membership.entity';
import { IMembershipRepository } from '../../../domain/interfaces/membership.repository.interface';
import { MembershipModel } from '../models/membership.model';
import { ClubModel } from '../models/club.model';

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

  async listOfficerClubsByUser(
    collegeId: string,
    userId: string,
  ): Promise<UserClubMembership[]> {
    const memberships = await MembershipModel.find({
      collegeId: new mongoose.Types.ObjectId(collegeId),
      userId: new mongoose.Types.ObjectId(userId),
      status: MembershipStatus.ACTIVE,
      role: { $in: OFFICER_ROLES },
    }).lean();

    if (!memberships.length) {
      return [];
    }

    const clubIds = memberships.map((membership) => membership.clubId);
    const clubs = await ClubModel.find({
      _id: { $in: clubIds },
      isDeleted: false,
    }).lean();

    const clubMap = new Map(clubs.map((club) => [String(club._id), club]));
    const results: UserClubMembership[] = [];

    for (const membership of memberships) {
      const club = clubMap.get(String(membership.clubId));
      if (!club) continue;

      results.push({
        clubId: String(club._id),
        name: club.name,
        slug: club.slug,
        logoUrl: club.logoUrl,
        memberCount: club.memberCount,
        role: membership.role as MembershipRole,
        status: membership.status as MembershipStatus,
      });
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const membershipRepository = new MongoMembershipRepository();
