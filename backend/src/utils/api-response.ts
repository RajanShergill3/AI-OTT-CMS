import type { Request, Response } from 'express';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta?: {
    requestId?: string;
    timestamp: string;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  options?: { status?: number; message?: string; meta?: Record<string, unknown> },
): Response => {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (options?.message) {
    body.message = options.message;
  }

  if (options?.meta) {
    body.meta = options.meta;
  }

  return res.status(options?.status ?? 200).json(body);
};

export const sendError = (
  res: Response,
  options: {
    status: number;
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    requestId?: string;
  },
): Response => {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: options.code,
      message: options.message,
      ...(options.details ? { details: options.details } : {}),
    },
    meta: {
      ...(options.requestId ? { requestId: options.requestId } : {}),
      timestamp: new Date().toISOString(),
    },
  };

  return res.status(options.status).json(body);
};

export const getRequestId = (req: Request): string | undefined => {
  const header = req.headers['x-request-id'];
  return typeof header === 'string' ? header : undefined;
};
