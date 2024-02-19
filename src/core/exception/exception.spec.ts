import { HttpStatus } from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';

import {
  BAD_REQUEST_BODY,
  ROUTE_NOT_FOUND,
  UNKNOWN_INTERNAL_SERVER_ERROR,
} from './core-exceptions.js';
import { exception, Exception } from './exception.js';
import { ExceptionType } from './exception.type.js';

describe('exception', () => {
  it('should convert to JSON', () => {
    const error = new Exception(
      HttpStatus.NOT_FOUND,
      'message',
      '0001',
      'error',
      'description',
      '1',
      '2',
    );
    expect(error.toJSON()).toEqual({
      status: HttpStatus.NOT_FOUND,
      message: 'message',
      errorCode: '0001',
      error: 'error',
      correlationId: '1',
      traceId: '2',
    } satisfies ExceptionType);
  });

  it.each([
    {
      name: 'same exception',
      left: ROUTE_NOT_FOUND('not found'),
      right: ROUTE_NOT_FOUND('not found 2'),
      expected: true,
    },
    {
      name: 'different exception',
      left: UNKNOWN_INTERNAL_SERVER_ERROR(),
      right: BAD_REQUEST_BODY(''),
      expected: false,
    },
    {
      name: 'not exception',
      left: UNKNOWN_INTERNAL_SERVER_ERROR(),
      right: {},
      expected: false,
    },
    {
      name: 'mock exception',
      left: UNKNOWN_INTERNAL_SERVER_ERROR(),
      right: {
        errorCode: 'CORE-0005',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      },
      expected: false,
    },
  ])(
    'should check if exception is equal ($name)',
    ({ left, right, expected }) => {
      expect(left.equals(right)).toBe(expected);
    },
  );

  it('should use args.error', () => {
    expect(
      exception({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: '1',
        error: 'error',
      })().error,
    ).toBe('error');
  });

  it('should use error', () => {
    expect(
      exception({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: '1',
      })('error 2').error,
    ).toBe('error 2');
  });

  it('should use status code error', () => {
    expect(
      exception({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: '1',
      })('').error,
    ).toEqual(getReasonPhrase(HttpStatus.INTERNAL_SERVER_ERROR));
  });
});
