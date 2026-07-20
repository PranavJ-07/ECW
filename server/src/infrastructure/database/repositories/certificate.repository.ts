import { CertificateNotFoundError } from '../../../domain/errors/certificate.errors';
import {
  Certificate,
  CertificateVerificationView,
  CertificateWithUser,
} from '../../../domain/entities/certificate.entity';
import { CertificateStatus } from '../../../domain/enums/certificate.enum';
import {
  CreateCertificateData,
  ICertificateRepository,
  ListEventCertificatesFilter,
  ListUserCertificatesFilter,
  PaginatedCertificates,
  PaginatedUserCertificates,
} from '../../../domain/interfaces/certificate.repository.interface';
import { CertificateDocument, CertificateModel } from '../models/certificate.model';

function toEntity(doc: CertificateDocument): Certificate {
  return {
    id: doc._id.toString(),
    collegeId: doc.collegeId.toString(),
    eventId: doc.eventId.toString(),
    clubId: doc.clubId.toString(),
    userId: doc.userId.toString(),
    registrationId: doc.registrationId.toString(),
    certificateNumber: doc.certificateNumber,
    verificationCode: doc.verificationCode,
    recipientName: doc.recipientName,
    eventTitle: doc.eventTitle,
    eventDate: doc.eventDate,
    clubName: doc.clubName,
    issuedAt: doc.issuedAt,
    issuedBy: doc.issuedBy.toString(),
    fileUrl: doc.fileUrl,
    status: doc.status as CertificateStatus,
    revokedAt: doc.revokedAt,
    revokedBy: doc.revokedBy?.toString(),
    revokeReason: doc.revokeReason,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoCertificateRepository implements ICertificateRepository {
  async create(data: CreateCertificateData): Promise<Certificate> {
    const doc = await CertificateModel.create({
      ...data,
      issuedAt: new Date(),
      status: CertificateStatus.ISSUED,
    });

    return toEntity(doc);
  }

  async findById(collegeId: string, id: string): Promise<Certificate | null> {
    const doc = await CertificateModel.findOne({ _id: id, collegeId });
    return doc ? toEntity(doc) : null;
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<Certificate | null> {
    const doc = await CertificateModel.findOne({ eventId, userId });
    return doc ? toEntity(doc) : null;
  }

  async findByVerificationCode(code: string): Promise<Certificate | null> {
    const doc = await CertificateModel.findOne({ verificationCode: code });
    return doc ? toEntity(doc) : null;
  }

  async getVerificationView(code: string): Promise<CertificateVerificationView | null> {
    const doc = await CertificateModel.findOne({ verificationCode: code }).populate(
      'collegeId',
      'name',
    );

    if (!doc) {
      return null;
    }

    const college = doc.collegeId as unknown as { name?: string };

    return {
      certificateNumber: doc.certificateNumber,
      recipientName: doc.recipientName,
      eventTitle: doc.eventTitle,
      eventDate: doc.eventDate,
      clubName: doc.clubName,
      issuedAt: doc.issuedAt,
      status: doc.status as CertificateStatus,
      collegeName: college?.name,
    };
  }

  async listByEvent(filter: ListEventCertificatesFilter): Promise<PaginatedCertificates> {
    const query: Record<string, unknown> = {
      collegeId: filter.collegeId,
      eventId: filter.eventId,
    };

    if (filter.status) {
      query.status = filter.status;
    }

    const skip = (filter.page - 1) * filter.limit;

    const [docs, total] = await Promise.all([
      CertificateModel.find(query)
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(filter.limit)
        .populate('userId', 'firstName lastName email'),
      CertificateModel.countDocuments(query),
    ]);

    const certificates: CertificateWithUser[] = docs
      .filter((doc) => doc.userId && typeof doc.userId === 'object')
      .map((doc) => {
        const user = doc.userId as unknown as {
          _id: { toString(): string };
          firstName: string;
          lastName: string;
          email: string;
        };

        return {
          ...toEntity(doc),
          user: {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        };
      });

    return {
      certificates,
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit) || 1,
    };
  }

  async listByUser(filter: ListUserCertificatesFilter): Promise<PaginatedUserCertificates> {
    const query: Record<string, unknown> = {
      collegeId: filter.collegeId,
      userId: filter.userId,
    };

    if (filter.status) {
      query.status = filter.status;
    } else {
      query.status = CertificateStatus.ISSUED;
    }

    const skip = (filter.page - 1) * filter.limit;

    const [docs, total] = await Promise.all([
      CertificateModel.find(query).sort({ issuedAt: -1 }).skip(skip).limit(filter.limit),
      CertificateModel.countDocuments(query),
    ]);

    return {
      certificates: docs.map(toEntity),
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit) || 1,
    };
  }

  async revoke(
    collegeId: string,
    id: string,
    update: { revokedBy: string; revokeReason?: string },
  ): Promise<Certificate> {
    const doc = await CertificateModel.findOneAndUpdate(
      { _id: id, collegeId, status: CertificateStatus.ISSUED },
      {
        $set: {
          status: CertificateStatus.REVOKED,
          revokedAt: new Date(),
          revokedBy: update.revokedBy,
          revokeReason: update.revokeReason,
        },
      },
      { new: true },
    );

    if (!doc) {
      throw new CertificateNotFoundError();
    }

    return toEntity(doc);
  }
}

export const certificateRepository = new MongoCertificateRepository();
