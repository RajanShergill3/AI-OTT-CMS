import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        tenantId?: string;
      };
    }
  }
}

export type AuthenticatedRequest = Request & {
  user: NonNullable<Request['user']>;
};
