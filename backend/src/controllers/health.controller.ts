import type { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { getDatabaseStatus } from '../config/connection.js';
import { sendSuccess } from '../utils/api-response.js';

export const getHealth = (_req: Request, res: Response): void => {
  sendSuccess(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: getDatabaseStatus(),
    },
    { status: HTTP_STATUS.OK },
  );
};
