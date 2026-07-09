import mongoose, { type HydratedDocument, type Model, Schema } from 'mongoose';

import { comparePassword, hashPassword } from '../utils/password.util.js';

/** Application roles stored on the user document. */
export const USER_ROLES = ['ADMIN', 'EDITOR', 'VIEWER'] as const;

export type UserRole = (typeof USER_ROLES)[number];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/i;
const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  profileImage: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [1, 'First name cannot be empty'],
      maxlength: [NAME_MAX_LENGTH, `First name cannot exceed ${NAME_MAX_LENGTH} characters`],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name cannot be empty'],
      maxlength: [NAME_MAX_LENGTH, `Last name cannot exceed ${NAME_MAX_LENGTH} characters`],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [EMAIL_MAX_LENGTH, `Email cannot exceed ${EMAIL_MAX_LENGTH} characters`],
      validate: {
        validator: (value: string) => EMAIL_REGEX.test(value),
        message: 'Email must be a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: 'Role must be one of: ADMIN, EDITOR, VIEWER',
      },
      default: 'VIEWER',
      required: [true, 'Role is required'],
    },
    profileImage: {
      type: String,
      default: null,
      validate: {
        validator: (value: string | null) => value === null || URL_REGEX.test(value),
        message: 'Profile image must be a valid HTTP or HTTPS URL',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { password: _password, ...safeUser } = ret;
        return safeUser;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { password: _password, ...safeUser } = ret;
        return safeUser;
      },
    },
  },
);

userSchema.index({ email: 1 }, { unique: true, name: 'idx_users_email' });
userSchema.index({ role: 1 }, { name: 'idx_users_role' });
userSchema.index({ isActive: 1 }, { name: 'idx_users_is_active' });
userSchema.index({ role: 1, isActive: 1 }, { name: 'idx_users_role_is_active' });
userSchema.index({ lastLogin: -1 }, { name: 'idx_users_last_login' });

userSchema.pre('save', async function () {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }

  if (!this.isModified('password')) {
    return;
  }

  this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string,
): Promise<boolean> {
  return comparePassword(candidatePassword, this.password);
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
