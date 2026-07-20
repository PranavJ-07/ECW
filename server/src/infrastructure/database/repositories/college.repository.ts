import { College } from '../../../domain/entities/college.entity';
import { ICollegeRepository } from '../../../domain/interfaces/college.repository.interface';
import { CollegeModel, CollegeDocument } from '../models/college.model';

function toCollegeEntity(doc: CollegeDocument): College {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    allowedEmailDomains: doc.allowedEmailDomains,
    isActive: doc.isActive,
  };
}

/**
 * MongoDB implementation of ICollegeRepository.
 * Maps Mongoose documents to domain entities — no Mongoose leaks upward.
 */
export class MongoCollegeRepository implements ICollegeRepository {
  async findById(id: string): Promise<College | null> {
    const doc = await CollegeModel.findById(id);
    return doc ? toCollegeEntity(doc) : null;
  }

  async findBySlug(slug: string): Promise<College | null> {
    const doc = await CollegeModel.findOne({ slug: slug.toLowerCase().trim() });
    return doc ? toCollegeEntity(doc) : null;
  }
}

export const collegeRepository = new MongoCollegeRepository();
