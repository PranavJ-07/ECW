import { NotFoundError } from '../../../domain/errors';
import {
  AccountDeactivatedError,
  AccountLockedError,
  InvalidCredentialsError,
} from '../../../domain/errors/auth.errors';
import { ICollegeRepository } from '../../../domain/interfaces/college.repository.interface';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { IPasswordService } from '../../../domain/interfaces/password.service.interface';
import {
  IAuthTokenService,
  TokenPair,
} from '../../../domain/interfaces/token.service.interface';

export interface LoginUserInput {
  email: string;
  password: string;
  collegeSlug: string;
}

export interface LoginUserOutput extends TokenPair {
  tokenType: 'Bearer';
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

/**
 * Authenticates a user and returns a short-lived JWT access token.
 */
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly collegeRepository: ICollegeRepository,
    private readonly passwordService: IPasswordService,
    private readonly authTokenService: IAuthTokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const college = await this.collegeRepository.findBySlug(input.collegeSlug);

    if (!college || !college.isActive) {
      throw new NotFoundError('College not found', 'COLLEGE_NOT_FOUND');
    }

    const normalizedEmail = input.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmailWithPassword(college.id, normalizedEmail);

    // Generic error — don't reveal whether email exists
    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new AccountDeactivatedError();
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new AccountLockedError();
    }

    const isPasswordValid = await this.passwordService.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const lockUntil =
        newAttempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS) : null;

      await this.userRepository.incrementFailedLoginAttempts(user.id, lockUntil);
      throw new InvalidCredentialsError();
    }

    await this.userRepository.updateLoginSuccess(user.id);

    const tokens = this.authTokenService.generateAccessToken({
      sub: user.id,
      collegeId: user.collegeId,
      roles: user.roles,
      platformRole: user.platformRole,
    });

    return {
      ...tokens,
      tokenType: 'Bearer',
    };
  }
}
