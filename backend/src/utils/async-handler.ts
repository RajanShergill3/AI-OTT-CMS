import type { NextFunction, Request, RequestHandler, Response } from 'express';

type RequestHandlerFn = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export const asyncHandler =
  (fn: RequestHandlerFn): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
