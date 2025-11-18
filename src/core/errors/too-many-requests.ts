import APIError from './api-error';
import { StatusCodes } from 'http-status-codes';

class TooManyRequests extends APIError {
  constructor(message: string = 'Too Many Requests') {
    super(message, StatusCodes.TOO_MANY_REQUESTS);
  }
}

export default TooManyRequests;
