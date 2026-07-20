import mongoose from 'mongoose';
import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { EventNotFoundError } from '../../../domain/errors/event.errors';
import {
  AnalyticsDateRange,
  ClubAnalytics,
  CollegeOverviewAnalytics,
  EventAnalytics,
} from '../../../domain/entities/analytics.entity';
import { AttendanceCheckInMethod } from '../../../domain/enums/attendance.enum';
import { ClubStatus } from '../../../domain/enums/club.enum';
import { EventStatus } from '../../../domain/enums/event.enum';
import { ExpenseStatus } from '../../../domain/enums/budget.enum';
import { CertificateStatus } from '../../../domain/enums/certificate.enum';
import { RegistrationStatus } from '../../../domain/enums/registration.enum';
import { MembershipStatus } from '../../../domain/enums/club.enum';
import { IAnalyticsRepository } from '../../../domain/interfaces/analytics.repository.interface';
import { AttendanceCheckInModel } from '../models/attendance-checkin.model';
import { CertificateModel } from '../models/certificate.model';
import { ClubBudgetModel } from '../models/club-budget.model';
import { ClubModel } from '../models/club.model';
import { EventModel } from '../models/event.model';
import { ExpenseModel } from '../models/expense.model';
import { MembershipModel } from '../models/membership.model';
import { RegistrationModel } from '../models/registration.model';

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function calcRate(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}

function buildDateFilter(field: string, period?: AnalyticsDateRange): Record<string, unknown> {
  if (!period?.from && !period?.to) {
    return {};
  }

  const range: Record<string, Date> = {};

  if (period.from) {
    range.$gte = period.from;
  }

  if (period.to) {
    range.$lte = period.to;
  }

  return { [field]: range };
}

export class MongoAnalyticsRepository implements IAnalyticsRepository {
  async getCollegeOverview(
    collegeId: string,
    period?: AnalyticsDateRange,
  ): Promise<CollegeOverviewAnalytics> {
    const collegeObjectId = toObjectId(collegeId);
    const now = new Date();
    const eventDateFilter = buildDateFilter('startAt', period);

    const [
      totalClubs,
      activeClubs,
      eventStats,
      registrationStats,
      activeMemberships,
      certificatesIssued,
      topClubs,
      registrationTrend,
    ] = await Promise.all([
      ClubModel.countDocuments({ collegeId: collegeObjectId, isDeleted: false }),
      ClubModel.countDocuments({
        collegeId: collegeObjectId,
        isDeleted: false,
        status: ClubStatus.ACTIVE,
      }),
      this.getEventStats(collegeObjectId, eventDateFilter, now),
      this.getRegistrationStatsForCollege(collegeObjectId, period),
      MembershipModel.countDocuments({
        collegeId: collegeObjectId,
        status: MembershipStatus.ACTIVE,
      }),
      CertificateModel.countDocuments({
        collegeId: collegeObjectId,
        status: CertificateStatus.ISSUED,
      }),
      this.getTopClubs(collegeObjectId),
      this.getRegistrationTrend(collegeObjectId),
    ]);

    const attended = registrationStats.attended;
    const totalRegistrations = registrationStats.total;

    return {
      collegeId,
      generatedAt: now,
      period,
      clubs: { total: totalClubs, active: activeClubs },
      events: eventStats,
      registrations: {
        total: totalRegistrations,
        attended,
        attendanceRate: calcRate(attended, totalRegistrations),
      },
      memberships: { active: activeMemberships },
      certificates: { issued: certificatesIssued },
      topClubs,
      registrationTrend,
    };
  }

  async getClubAnalytics(
    collegeId: string,
    clubId: string,
    period?: AnalyticsDateRange,
  ): Promise<ClubAnalytics> {
    const collegeObjectId = toObjectId(collegeId);
    const clubObjectId = toObjectId(clubId);
    const now = new Date();

    const club = await ClubModel.findOne({
      _id: clubObjectId,
      collegeId: collegeObjectId,
      isDeleted: false,
    });

    if (!club) {
      throw new ClubNotFoundError();
    }

    const eventDateFilter = buildDateFilter('startAt', period);
    const eventQuery = {
      collegeId: collegeObjectId,
      clubId: clubObjectId,
      isDeleted: false,
      ...eventDateFilter,
    };

    const eventIds = await EventModel.find(eventQuery).distinct('_id');

    const [
      eventStats,
      registrationStats,
      budgetStats,
      certificatesIssued,
    ] = await Promise.all([
      this.getEventStatsForQuery(eventQuery, now),
      this.getRegistrationStatsForEvents(eventIds, period),
      this.getBudgetStats(clubObjectId),
      CertificateModel.countDocuments({
        collegeId: collegeObjectId,
        clubId: clubObjectId,
        status: CertificateStatus.ISSUED,
      }),
    ]);

    return {
      collegeId,
      clubId,
      clubName: club.name,
      clubSlug: club.slug,
      generatedAt: now,
      period,
      members: {
        total: club.memberCount,
        officers: club.officerCount,
      },
      events: eventStats,
      registrations: {
        total: registrationStats.total,
        attended: registrationStats.attended,
        attendanceRate: calcRate(registrationStats.attended, registrationStats.total),
      },
      budget: budgetStats,
      certificates: { issued: certificatesIssued },
    };
  }

  async getEventAnalytics(collegeId: string, eventId: string): Promise<EventAnalytics> {
    const collegeObjectId = toObjectId(collegeId);
    const eventObjectId = toObjectId(eventId);
    const now = new Date();

    const event = await EventModel.findOne({
      _id: eventObjectId,
      collegeId: collegeObjectId,
      isDeleted: false,
    });

    if (!event) {
      throw new EventNotFoundError();
    }

    const [statusCounts, checkInStats, certificatesIssued] = await Promise.all([
      RegistrationModel.aggregate([
        { $match: { eventId: eventObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      AttendanceCheckInModel.aggregate([
        { $match: { eventId: eventObjectId } },
        { $group: { _id: '$method', count: { $sum: 1 } } },
      ]),
      CertificateModel.countDocuments({
        collegeId: collegeObjectId,
        eventId: eventObjectId,
        status: CertificateStatus.ISSUED,
      }),
    ]);

    const statusMap = Object.fromEntries(
      statusCounts.map((s: { _id: string; count: number }) => [s._id, s.count]),
    ) as Record<string, number>;

    const registered = statusMap[RegistrationStatus.REGISTERED] ?? 0;
    const attended = statusMap[RegistrationStatus.ATTENDED] ?? 0;
    const cancelled = statusMap[RegistrationStatus.CANCELLED] ?? 0;
    const waitlisted = statusMap[RegistrationStatus.WAITLISTED] ?? 0;
    const noShow = statusMap[RegistrationStatus.NO_SHOW] ?? 0;

    const checkInMap = Object.fromEntries(
      checkInStats.map((c: { _id: string; count: number }) => [c._id, c.count]),
    ) as Record<string, number>;

    const capacity = event.capacity;
    const fillRate = capacity ? calcRate(event.registrationCount, capacity) : 100;

    return {
      collegeId,
      eventId: event._id.toString(),
      eventTitle: event.title,
      eventSlug: event.slug,
      clubId: event.clubId.toString(),
      generatedAt: now,
      capacity,
      registrationCount: event.registrationCount,
      waitlistCount: event.waitlistCount,
      fillRate,
      attendance: {
        registered,
        attended,
        cancelled,
        waitlisted,
        noShow,
        attendanceRate: calcRate(attended, registered + attended + noShow),
      },
      checkIns: {
        total: (checkInMap[AttendanceCheckInMethod.QR_SCAN] ?? 0) +
          (checkInMap[AttendanceCheckInMethod.MANUAL] ?? 0),
        qrScan: checkInMap[AttendanceCheckInMethod.QR_SCAN] ?? 0,
        manual: checkInMap[AttendanceCheckInMethod.MANUAL] ?? 0,
      },
      certificates: { issued: certificatesIssued },
    };
  }

  private async getEventStats(
    collegeObjectId: mongoose.Types.ObjectId,
    dateFilter: Record<string, unknown>,
    now: Date,
  ) {
    return this.getEventStatsForQuery(
      { collegeId: collegeObjectId, isDeleted: false, ...dateFilter },
      now,
    );
  }

  private async getEventStatsForQuery(
    query: Record<string, unknown>,
    now: Date,
  ) {
    const [total, published, upcoming, cancelled] = await Promise.all([
      EventModel.countDocuments(query),
      EventModel.countDocuments({ ...query, status: EventStatus.PUBLISHED }),
      EventModel.countDocuments({
        ...query,
        status: EventStatus.PUBLISHED,
        startAt: { $gte: now },
      }),
      EventModel.countDocuments({ ...query, status: EventStatus.CANCELLED }),
    ]);

    return { total, published, upcoming, cancelled };
  }

  private async getRegistrationStatsForCollege(
    collegeObjectId: mongoose.Types.ObjectId,
    period?: AnalyticsDateRange,
  ) {
    const match: Record<string, unknown> = {
      collegeId: collegeObjectId,
      ...buildDateFilter('createdAt', period),
    };

    const [total, attended] = await Promise.all([
      RegistrationModel.countDocuments(match),
      RegistrationModel.countDocuments({ ...match, status: RegistrationStatus.ATTENDED }),
    ]);

    return { total, attended };
  }

  private async getRegistrationStatsForEvents(
    eventIds: mongoose.Types.ObjectId[],
    period?: AnalyticsDateRange,
  ) {
    if (eventIds.length === 0) {
      return { total: 0, attended: 0 };
    }

    const match: Record<string, unknown> = {
      eventId: { $in: eventIds },
      ...buildDateFilter('createdAt', period),
    };

    const [total, attended] = await Promise.all([
      RegistrationModel.countDocuments(match),
      RegistrationModel.countDocuments({ ...match, status: RegistrationStatus.ATTENDED }),
    ]);

    return { total, attended };
  }

  private async getTopClubs(collegeObjectId: mongoose.Types.ObjectId) {
    const clubs = await ClubModel.find({
      collegeId: collegeObjectId,
      isDeleted: false,
      status: ClubStatus.ACTIVE,
    })
      .sort({ memberCount: -1 })
      .limit(5)
      .select('name slug memberCount');

    const results = await Promise.all(
      clubs.map(async (club) => {
        const eventCount = await EventModel.countDocuments({
          clubId: club._id,
          isDeleted: false,
        });

        return {
          clubId: club._id.toString(),
          name: club.name,
          slug: club.slug,
          memberCount: club.memberCount,
          eventCount,
        };
      }),
    );

    return results;
  }

  private async getRegistrationTrend(collegeObjectId: mongoose.Types.ObjectId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trend = await RegistrationModel.aggregate([
      {
        $match: {
          collegeId: collegeObjectId,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return trend.map((point: { _id: { year: number; month: number }; count: number }) => ({
      period: `${point._id.year}-${String(point._id.month).padStart(2, '0')}`,
      count: point.count,
    }));
  }

  private async getBudgetStats(clubObjectId: mongoose.Types.ObjectId) {
    const budgets = await ClubBudgetModel.find({ clubId: clubObjectId }).select(
      'allocatedAmountCents',
    );

    const totalAllocatedCents = budgets.reduce((sum, b) => sum + b.allocatedAmountCents, 0);

    const spentResult = await ExpenseModel.aggregate([
      {
        $match: {
          clubId: clubObjectId,
          status: ExpenseStatus.PAID,
        },
      },
      { $group: { _id: null, total: { $sum: '$amountCents' } } },
    ]);

    const totalSpentCents = spentResult[0]?.total ?? 0;

    return {
      totalAllocatedCents,
      totalSpentCents,
      utilizationRate: calcRate(totalSpentCents, totalAllocatedCents),
    };
  }
}

export const analyticsRepository = new MongoAnalyticsRepository();
