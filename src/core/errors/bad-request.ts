import APIError from './api-error';
import { StatusCodes } from 'http-status-codes';

class BadRequestError extends APIError {
  constructor(message: string = 'Bad Request Error') {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export default BadRequestError;
