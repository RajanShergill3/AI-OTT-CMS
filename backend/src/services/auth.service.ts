import { TOKEN_TYPE } from '../constants/auth.constants.js';
import { ERROR_CODES } from '../constants/error-codes.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { AppError } from '../middleware/error.middleware.js';
import type { IUser, UserDocument } from '../models/user.model.js';
import { User } from '../models/user.model.js';
import type {
  AuthSessionResponse,
  AuthTokenResponse,
  AuthUserResponse,
  LoginInput,
  RegisterInput,
  UserProfileResponse,
} from '../types/auth.types.js';
import { getTokenExpiresInSeconds } from '../utils/auth-cookie.util.js';
import { comparePassword } from '../utils/password.util.js';
import {
  generateAccessToken,
  generateRefreshToken,
  JwtVerificationError,
  verifyRefreshToken,
} from './jwt.service.js';

const isDuplicateKeyError = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  );
};

const formatRole = (role: string): string => role.toLowerCase();

const toAuthUserResponse = (user: IUser & { _id: { toString(): string } }): AuthUserResponse => {
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: `${user.firstName} ${user.lastName}`.trim(),
    role: formatRole(user.role),
    avatarUrl: user.profileImage,
  };
};

const toUserProfileResponse = (user: UserDocument): UserProfileResponse => {
  return {
    ...toAuthUserResponse(user),
    isActive: user.isActive,
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

const assertActiveUser = (user: UserDocument): void => {
  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Contact an administrator.',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.ACCOUNT_INACTIVE,
    );
  }
};

const createAuthTokens = (user: UserDocument): AuthTokenResponse => {
  const userId = user._id.toString();
  const accessToken = generateAccessToken({
    userId,
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({ userId });

  return {
    accessToken,
    refreshToken,
    expiresIn: getTokenExpiresInSeconds(accessToken),
    tokenType: TOKEN_TYPE,
  };
};

const createAuthSession = (user: UserDocument): AuthSessionResponse => {
  const tokens = createAuthTokens(user);

  return {
    ...tokens,
    user: toAuthUserResponse(user),
  };
};

const findUserByEmailWithPassword = async (email: string): Promise<UserDocument | null> => {
  return User.findOne({ email: email.toLowerCase() }).select('+password') as Promise<UserDocument | null>;
};

const findUserById = async (userId: string): Promise<UserDocument | null> => {
  return User.findById(userId);
};

/**
 * Register a new user account and issue auth tokens.
 */
export const register = async (input: RegisterInput): Promise<AuthSessionResponse> => {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });

  if (existingUser) {
    throw new AppError(
      'Email already registered',
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.DUPLICATE_EMAIL,
    );
  }

  try {
    const user = await User.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password,
      role: input.role ?? 'VIEWER',
      isActive: true,
    });

    return createAuthSession(user);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(
        'Email already registered',
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.DUPLICATE_EMAIL,
      );
    }

    throw error;
  }
};

/**
 * Authenticate a user with email and password.
 */
export const login = async (input: LoginInput): Promise<AuthSessionResponse> => {
  const user = await findUserByEmailWithPassword(input.email);

  if (!user) {
    throw new AppError(
      'Invalid email or password',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_CREDENTIALS,
    );
  }

  assertActiveUser(user);

  const isPasswordValid = await comparePassword(input.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(
      'Invalid email or password',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_CREDENTIALS,
    );
  }

  user.lastLogin = new Date();
  await user.save();

  return createAuthSession(user);
};

/**
 * Exchange a refresh token for a new access token and rotated refresh token.
 */
export const refreshSession = async (refreshToken: string): Promise<AuthTokenResponse> => {
  if (!refreshToken) {
    throw new AppError(
      'Refresh token is invalid or expired. Please log in again.',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_REFRESH_TOKEN,
    );
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await findUserById(payload.userId);

    if (!user) {
      throw new AppError(
        'Refresh token is invalid or expired. Please log in again.',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_REFRESH_TOKEN,
      );
    }

    assertActiveUser(user);

    return createAuthTokens(user);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof JwtVerificationError) {
      throw new AppError(
        'Refresh token is invalid or expired. Please log in again.',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_REFRESH_TOKEN,
      );
    }

    throw error;
  }
};

/**
 * Retrieve the authenticated user's profile.
 */
export const getProfile = async (userId: string): Promise<UserProfileResponse> => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  return toUserProfileResponse(user);
};
