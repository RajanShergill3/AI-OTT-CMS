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

/** Routes that do not accept query parameters. */
export type EmptyQuery = Record<string, never>;

/**
 * Request shape after Zod validation middleware has parsed body, query, and/or params.
 */
export type ValidatedRequest<
  TBody = unknown,
  TQuery = Request['query'],
  TParams = Request['params'],
> = Omit<AuthenticatedRequest, 'body' | 'query' | 'params'> & {
  body: TBody;
  query: TQuery;
  params: TParams;
};
