import { Club, ClubSummary } from '../entities/club.entity';
import { ClubCategory, ClubStatus } from '../enums/club.enum';

export interface CreateClubData {
  collegeId: string;
  name: string;
  slug: string;
  description?: string;
  category: ClubCategory;
  tags?: string[];
  contactEmail?: string;
  facultyAdvisorId?: string;
  visibility?: import('../enums/club.enum').ClubVisibility;
  createdBy: string;
}

export interface UpdateClubData {
  name?: string;
  description?: string;
  category?: ClubCategory;
  tags?: string[];
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  socialLinks?: { instagram?: string; website?: string };
  facultyAdvisorId?: string;
  visibility?: import('../enums/club.enum').ClubVisibility;
  updatedBy: string;
}

export interface ListClubsFilter {
  collegeId: string;
  category?: ClubCategory;
  status?: ClubStatus;
  search?: string;
  page: number;
  limit: number;
  sort: string;
}

export interface PaginatedClubs {
  clubs: ClubSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IClubRepository {
  findBySlug(collegeId: string, slug: string): Promise<Club | null>;
  findById(collegeId: string, id: string): Promise<Club | null>;
  slugExists(collegeId: string, slug: string): Promise<boolean>;
  create(data: CreateClubData): Promise<Club>;
  update(collegeId: string, clubId: string, data: UpdateClubData): Promise<Club>;
  archive(collegeId: string, clubId: string, updatedBy: string): Promise<Club>;
  list(filter: ListClubsFilter): Promise<PaginatedClubs>;
  listByFacultyAdvisor(collegeId: string, facultyId: string): Promise<ClubSummary[]>;
  countActiveByCollege(collegeId: string): Promise<number>;
}
