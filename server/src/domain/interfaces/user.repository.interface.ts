import { User } from '../entities/user.entity';

export interface CreateUserData {
  collegeId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  department?: string;
  academicYear?: number;
  studentId?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(collegeId: string, email: string): Promise<User | null>;
  findByEmailWithPassword(collegeId: string, email: string): Promise<(User & { passwordHash: string }) | null>;
  create(data: CreateUserData): Promise<User>;
  updateLoginSuccess(userId: string): Promise<void>;
  incrementFailedLoginAttempts(userId: string, lockUntil: Date | null): Promise<void>;
}
