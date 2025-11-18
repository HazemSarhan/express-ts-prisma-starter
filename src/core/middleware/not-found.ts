import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiErrorResponse } from '../../types/api';

const notFoundMiddleware = (req: Request, res: Response) => {
  const response: ApiErrorResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    status: StatusCodes.NOT_FOUND,
  };
  res.status(StatusCodes.NOT_FOUND).json(response);
};

export default notFoundMiddleware;
