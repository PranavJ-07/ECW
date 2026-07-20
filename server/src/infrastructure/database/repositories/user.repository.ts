import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import {
  CreateUserData,
  IUserRepository,
} from '../../../domain/interfaces/user.repository.interface';
import { UserModel, UserDocument } from '../models/user.model';

function toUserEntity(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    collegeId: doc.collegeId.toString(),
    email: doc.email,
    firstName: doc.firstName,
    lastName: doc.lastName,
    roles: doc.roles as UserRole[],
    platformRole: doc.platformRole,
    emailVerified: doc.emailVerified,
    isActive: doc.isActive,
    department: doc.department,
    academicYear: doc.academicYear,
    studentId: doc.studentId,
    failedLoginAttempts: doc.failedLoginAttempts,
    lockUntil: doc.lockUntil,
    lastLoginAt: doc.lastLoginAt,
    passwordChangedAt: doc.passwordChangedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * MongoDB implementation of IUserRepository.
 */
export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toUserEntity(doc) : null;
  }

  async findByEmail(collegeId: string, email: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      collegeId,
      email: email.toLowerCase().trim(),
    });
    return doc ? toUserEntity(doc) : null;
  }

  async findByEmailWithPassword(
    collegeId: string,
    email: string,
  ): Promise<(User & { passwordHash: string }) | null> {
    const doc = await UserModel.findOne({
      collegeId,
      email: email.toLowerCase().trim(),
    }).select('+passwordHash');

    if (!doc) return null;

    return {
      ...toUserEntity(doc),
      passwordHash: doc.passwordHash,
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const doc = await UserModel.create({
      collegeId: data.collegeId,
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      academicYear: data.academicYear,
      studentId: data.studentId,
      roles: [UserRole.STUDENT],
    });

    return toUserEntity(doc);
  }

  async updateLoginSuccess(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          failedLoginAttempts: 0,
          lockUntil: null,
          lastLoginAt: new Date(),
        },
      },
    );
  }

  async incrementFailedLoginAttempts(userId: string, lockUntil: Date | null): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $inc: { failedLoginAttempts: 1 },
        $set: { lockUntil },
      },
    );
  }
}

export const userRepository = new MongoUserRepository();
