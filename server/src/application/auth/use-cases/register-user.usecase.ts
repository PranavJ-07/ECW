import { NotFoundError } from '../../../domain/errors';
import { ConflictError, DomainNotAllowedError } from '../../../domain/errors/auth.errors';
import { ICollegeRepository } from '../../../domain/interfaces/college.repository.interface';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import { IPasswordService } from '../../../domain/interfaces/password.service.interface';

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  collegeSlug: string;
  department?: string;
  academicYear?: number;
  studentId?: string;
}

export interface RegisterUserOutput {
  message: string;
  userId: string;
}

/**
 * Registers a new student within a college tenant.
 * Validates email domain, enforces uniqueness, hashes password.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly collegeRepository: ICollegeRepository,
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const college = await this.collegeRepository.findBySlug(input.collegeSlug);

    if (!college || !college.isActive) {
      throw new NotFoundError('College not found', 'COLLEGE_NOT_FOUND');
    }

    const normalizedEmail = input.email.toLowerCase().trim();
    this.validateEmailDomain(normalizedEmail, college.allowedEmailDomains);

    const existingUser = await this.userRepository.findByEmail(college.id, normalizedEmail);
    if (existingUser) {
      throw new ConflictError('Email already registered for this college', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await this.passwordService.hash(input.password);

    const user = await this.userRepository.create({
      collegeId: college.id,
      email: normalizedEmail,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      department: input.department?.trim(),
      academicYear: input.academicYear,
      studentId: input.studentId?.trim(),
    });

    return {
      message: 'Registration successful. Please verify your email.',
      userId: user.id,
    };
  }

  private validateEmailDomain(email: string, allowedDomains: string[]): void {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain || !allowedDomains.map((d) => d.toLowerCase()).includes(domain)) {
      throw new DomainNotAllowedError();
    }
  }
}
