import APIError from './api-error';
import { StatusCodes } from 'http-status-codes';

class InternalServerError extends APIError {
  constructor(message: string = 'Internal Server Error') {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export default InternalServerError;
