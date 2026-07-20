import { College } from '../entities/college.entity';

export interface ICollegeRepository {
  findById(id: string): Promise<College | null>;
  findBySlug(slug: string): Promise<College | null>;
}
