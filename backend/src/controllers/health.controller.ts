import type { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { getDatabaseStatus } from '../database/index.js';
import { sendSuccess } from '../utils/api-response.js';

export const getHealth = (_req: Request, res: Response): void => {
  const database = getDatabaseStatus();

  sendSuccess(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: database.readyState,
      databaseDetails: {
        isConnected: database.isConnected,
        host: database.host,
        name: database.name,
      },
    },
    { status: HTTP_STATUS.OK },
  );
};
