import { GetMyClubsUseCase } from '../../../application/memberships/use-cases/get-my-clubs.usecase';
import { GetMyAdvisedClubsUseCase } from '../../../application/clubs/use-cases/get-my-advised-clubs.usecase';
import { membershipRepository } from '../../../infrastructure/database/repositories/membership.repository';
import { clubRepository } from '../../../infrastructure/database/repositories/club.repository';
import { MembershipController } from '../controllers/membership.controller';

const getMyClubsUseCase = new GetMyClubsUseCase(membershipRepository);
const getMyAdvisedClubsUseCase = new GetMyAdvisedClubsUseCase(clubRepository);

export const membershipController = new MembershipController(
  getMyClubsUseCase,
  getMyAdvisedClubsUseCase,
);
