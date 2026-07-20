import { ClubCategory, ClubStatus, ClubVisibility } from '../enums/club.enum';

export interface Club {
  id: string;
  collegeId: string;
  name: string;
  slug: string;
  description?: string;
  category: ClubCategory;
  tags: string[];
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  socialLinks?: {
    instagram?: string;
    website?: string;
  };
  facultyAdvisorId?: string;
  status: ClubStatus;
  visibility: ClubVisibility;
  memberCount: number;
  officerCount: number;
  createdBy: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe list view — fewer fields for grid/list responses */
export interface ClubSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: ClubCategory;
  logoUrl?: string;
  memberCount: number;
  status: ClubStatus;
  createdAt: Date;
}
