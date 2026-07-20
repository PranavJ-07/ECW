import { PlatformRole, UserRole } from '../enums/user-role.enum';

export interface AccessTokenPayload {
  sub: string;
  collegeId: string;
  roles: UserRole[];
  platformRole: PlatformRole | null;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  expiresIn: number;
}

export interface IAuthTokenService {
  generateAccessToken(payload: AccessTokenPayload): TokenPair;
  verifyAccessToken(token: string): AccessTokenPayload;
}
