import type { Request } from 'express';

export type { ChangePasswordInput, LoginInput, RefreshTokenInput, RegisterInput } from '../validators/auth.validator.js';

export type AuthenticatedRequest = Request & {
  user: NonNullable<Request['user']>;
};

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthSessionResponse extends AuthTokenResponse {
  user: AuthUserResponse;
}

export interface UserProfileResponse extends AuthUserResponse {
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}
