import bcrypt from 'bcrypt';
import { IPasswordService } from '../../../domain/interfaces/password.service.interface';

const BCRYPT_ROUNDS = 12;

/**
 * Handles password hashing and comparison.
 * Uses bcrypt with cost factor 12 — intentionally slow to resist brute force.
 */
export class PasswordService implements IPasswordService {
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
  }

  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}

export const passwordService = new PasswordService();
