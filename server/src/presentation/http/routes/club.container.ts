import { CreateClubUseCase } from '../../../application/clubs/use-cases/create-club.usecase';
import { ListClubsUseCase } from '../../../application/clubs/use-cases/list-clubs.usecase';
import { GetClubUseCase } from '../../../application/clubs/use-cases/get-club.usecase';
import { UpdateClubUseCase } from '../../../application/clubs/use-cases/update-club.usecase';
import { ArchiveClubUseCase } from '../../../application/clubs/use-cases/archive-club.usecase';
import { clubRepository } from '../../../infrastructure/database/repositories/club.repository';
import { membershipRepository } from '../../../infrastructure/database/repositories/membership.repository';
import { collegeRepository } from '../../../infrastructure/database/repositories/college.repository';
import { ClubController } from '../controllers/club.controller';

const createClubUseCase = new CreateClubUseCase(clubRepository, collegeRepository);
const listClubsUseCase = new ListClubsUseCase(clubRepository);
const getClubUseCase = new GetClubUseCase(clubRepository, membershipRepository);
const updateClubUseCase = new UpdateClubUseCase(clubRepository, membershipRepository);
const archiveClubUseCase = new ArchiveClubUseCase(clubRepository, membershipRepository);

export const clubController = new ClubController(
  createClubUseCase,
  listClubsUseCase,
  getClubUseCase,
  updateClubUseCase,
  archiveClubUseCase,
);
