import jwt from 'jsonwebtoken';
import { env } from '../../../config';
import { UnauthorizedError } from '../../../domain/errors';
import {
  AccessTokenPayload,
  IAuthTokenService,
  TokenPair,
} from '../../../domain/interfaces/token.service.interface';

/**
 * Signs and verifies JWT access tokens.
 * Refresh tokens will be added in a later module (Redis / MongoDB store).
 */
export class AuthTokenService implements IAuthTokenService {
  generateAccessToken(payload: AccessTokenPayload): TokenPair {
    const expiresInSeconds = this.parseExpiryToSeconds(env.JWT_ACCESS_EXPIRES_IN);

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: expiresInSeconds,
    });

    return {
      accessToken,
      expiresIn: expiresInSeconds,
    };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError('Invalid or expired token', 'TOKEN_INVALID');
    }
  }

  /** Converts strings like "15m", "1h", "7d" to seconds for JWT + client */
  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}

export const authTokenService = new AuthTokenService();
