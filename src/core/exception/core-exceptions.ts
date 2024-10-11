import { exception } from './exception.js';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export const BAD_REQUEST_BODY = exception({
  status: StatusCodes.BAD_REQUEST,
  errorCode: 'CORE-0001',
  message: 'The request body has invalid data',
});
export const BAD_REQUEST_QUERY = exception({
  status: StatusCodes.BAD_REQUEST,
  errorCode: 'CORE-0002',
  message: 'The request query has invalid data',
});
export const BAD_REQUEST_PARAMS = exception({
  status: StatusCodes.BAD_REQUEST,
  errorCode: 'CORE-0003',
  message: 'The request params has invalid data',
});
export const UNKNOWN_INTERNAL_SERVER_ERROR = exception({
  status: StatusCodes.INTERNAL_SERVER_ERROR,
  errorCode: 'CORE-0005',
  error: 'An unknown internal server error occurred',
});
export const TOO_MANY_REQUESTS = exception({
  status: StatusCodes.TOO_MANY_REQUESTS,
  error: 'Too Many Requests',
  errorCode: 'CORE-0006',
});
export const ROUTE_NOT_FOUND = exception({
  status: StatusCodes.NOT_FOUND,
  errorCode: 'CORE-0007',
});
export const INVALID_RESPONSE = exception({
  status: StatusCodes.INTERNAL_SERVER_ERROR,
  errorCode: 'CORE-0008',
  message:
    'Our server replied with the wrong response. Please contact the support.',
});
export const BAD_REQUEST_HEADERS = exception({
  status: StatusCodes.BAD_REQUEST,
  errorCode: 'CORE-0009',
  message: 'The request headers has invalid data',
});
export const FORBIDDEN = exception({
  errorCode: 'CORE-0010',
  error: getReasonPhrase(StatusCodes.FORBIDDEN),
  message: getReasonPhrase(StatusCodes.FORBIDDEN),
  status: StatusCodes.FORBIDDEN,
});
