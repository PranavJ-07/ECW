import { Club, ClubSummary } from '../../../domain/entities/club.entity';
import { ClubNotFoundError } from '../../../domain/errors/club.errors';
import { ClubCategory, ClubStatus, ClubVisibility } from '../../../domain/enums/club.enum';
import {
  CreateClubData,
  IClubRepository,
  ListClubsFilter,
  PaginatedClubs,
  UpdateClubData,
} from '../../../domain/interfaces/club.repository.interface';
import { ClubModel, ClubDocument } from '../models/club.model';

function toClubEntity(doc: ClubDocument): Club {
  return {
    id: doc._id.toString(),
    collegeId: doc.collegeId.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    category: doc.category as ClubCategory,
    tags: doc.tags,
    logoUrl: doc.logoUrl,
    bannerUrl: doc.bannerUrl,
    contactEmail: doc.contactEmail,
    socialLinks: doc.socialLinks,
    facultyAdvisorId: doc.facultyAdvisorId?.toString(),
    status: doc.status as ClubStatus,
    visibility: doc.visibility as ClubVisibility,
    memberCount: doc.memberCount,
    officerCount: doc.officerCount,
    createdBy: doc.createdBy.toString(),
    updatedBy: doc.updatedBy?.toString(),
    isDeleted: doc.isDeleted,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toClubSummary(doc: ClubDocument): ClubSummary {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    category: doc.category as ClubCategory,
    logoUrl: doc.logoUrl,
    memberCount: doc.memberCount,
    status: doc.status as ClubStatus,
    createdAt: doc.createdAt,
  };
}

export class MongoClubRepository implements IClubRepository {
  async findBySlug(collegeId: string, slug: string): Promise<Club | null> {
    const doc = await ClubModel.findOne({
      collegeId,
      slug: slug.toLowerCase().trim(),
      isDeleted: false,
    });
    return doc ? toClubEntity(doc) : null;
  }

  async findById(collegeId: string, id: string): Promise<Club | null> {
    const doc = await ClubModel.findOne({ _id: id, collegeId, isDeleted: false });
    return doc ? toClubEntity(doc) : null;
  }

  async slugExists(collegeId: string, slug: string): Promise<boolean> {
    const count = await ClubModel.countDocuments({
      collegeId,
      slug: slug.toLowerCase().trim(),
      isDeleted: false,
    });
    return count > 0;
  }

  async create(data: CreateClubData): Promise<Club> {
    const doc = await ClubModel.create({
      collegeId: data.collegeId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      tags: data.tags ?? [],
      contactEmail: data.contactEmail,
      facultyAdvisorId: data.facultyAdvisorId,
      visibility: data.visibility,
      createdBy: data.createdBy,
      status: ClubStatus.ACTIVE,
    });
    return toClubEntity(doc);
  }

  async update(collegeId: string, clubId: string, data: UpdateClubData): Promise<Club> {
    const doc = await ClubModel.findOneAndUpdate(
      { _id: clubId, collegeId, isDeleted: false },
      {
        $set: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.category && { category: data.category }),
          ...(data.tags && { tags: data.tags }),
          ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
          ...(data.bannerUrl !== undefined && { bannerUrl: data.bannerUrl }),
          ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
          ...(data.socialLinks !== undefined && { socialLinks: data.socialLinks }),
          ...(data.facultyAdvisorId !== undefined && { facultyAdvisorId: data.facultyAdvisorId }),
          ...(data.visibility && { visibility: data.visibility }),
          updatedBy: data.updatedBy,
        },
      },
      { new: true },
    );

    if (!doc) {
      throw new ClubNotFoundError();
    }

    return toClubEntity(doc);
  }

  async archive(collegeId: string, clubId: string, updatedBy: string): Promise<Club> {
    const doc = await ClubModel.findOneAndUpdate(
      { _id: clubId, collegeId, isDeleted: false },
      {
        $set: {
          status: ClubStatus.ARCHIVED,
          updatedBy,
          deletedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!doc) {
      throw new ClubNotFoundError();
    }

    return toClubEntity(doc);
  }

  async list(filter: ListClubsFilter): Promise<PaginatedClubs> {
    const query: Record<string, unknown> = {
      collegeId: filter.collegeId,
      isDeleted: false,
    };

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    const sortField = filter.sort.startsWith('-') ? filter.sort.slice(1) : filter.sort;
    const sortOrder = filter.sort.startsWith('-') ? -1 : 1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder as 1 | -1 };

    const skip = (filter.page - 1) * filter.limit;

    const [docs, total] = await Promise.all([
      ClubModel.find(query).sort(sort).skip(skip).limit(filter.limit),
      ClubModel.countDocuments(query),
    ]);

    return {
      clubs: docs.map(toClubSummary),
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    };
  }

  async countActiveByCollege(collegeId: string): Promise<number> {
    return ClubModel.countDocuments({
      collegeId,
      status: ClubStatus.ACTIVE,
      isDeleted: false,
    });
  }
}

export const clubRepository = new MongoClubRepository();
