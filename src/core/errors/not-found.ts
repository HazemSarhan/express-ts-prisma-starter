import APIError from './api-error';
import { StatusCodes } from 'http-status-codes';

class NotFoundError extends APIError {
  constructor(message: string = 'Not Found Error') {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export default NotFoundError;
