import { NotFoundError } from '../../../domain/errors';
import { AccountDeactivatedError } from '../../../domain/errors/auth.errors';
import { PublicUser, User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { ICollegeRepository } from '../../../domain/interfaces/college.repository.interface';
import { PermissionService } from '../services/permission.service';
import { College } from '../../../domain/entities/college.entity';

export interface GetCurrentUserOutput {
  user: PublicUser;
  permissions: string[];
  college: Pick<College, 'id' | 'name' | 'slug'>;
}

/**
 * Returns the authenticated user's profile, permissions, and college context.
 * Called by GET /auth/me after JWT verification.
 */
export class GetCurrentUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly collegeRepository: ICollegeRepository,
    private readonly permissionService: PermissionService,
  ) {}

  async execute(userId: string): Promise<GetCurrentUserOutput> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AccountDeactivatedError();
    }

    const college = await this.collegeRepository.findById(user.collegeId);

    if (!college) {
      throw new NotFoundError('College not found', 'COLLEGE_NOT_FOUND');
    }

    const permissions = this.permissionService.resolvePermissions(user.roles, user.platformRole);

    return {
      user: toPublicUser(user),
      permissions,
      college: {
        id: college.id,
        name: college.name,
        slug: college.slug,
      },
    };
  }
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    collegeId: user.collegeId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    platformRole: user.platformRole,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    department: user.department,
    academicYear: user.academicYear,
    studentId: user.studentId,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
