import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator.js';
import { getReasonPhrase } from 'http-status-codes';
import { Mock } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { generateSchema } from '../../common/generate-schema.js';

import { exception } from './exception.js';
import { Exceptions } from './exceptions.decorator.js';
import { ExceptionSchema } from './exceptions.schema.js';

vi.mock('@nestjs/swagger', () => {
  const originalModule = vi.importActual('@nestjs/swagger');
  return {
    ...originalModule,
    ApiResponse: vi.fn().mockImplementation(() => vi.fn()),
  };
});
vi.mock('./core-exceptions.js', () => ({}));

describe('exceptions.decorator', () => {
  const ApiResponseSpy = ApiResponse as Mock;
  const EXCEPTION1 = exception({
    errorCode: '1',
    error: 'error 1',
    status: HttpStatus.NOT_FOUND,
    description: 'desc',
  });
  const EXCEPTION2 = exception({
    errorCode: '2',
    status: HttpStatus.CONFLICT,
  });

  it('should call ApiResponse', () => {
    Exceptions([EXCEPTION1, EXCEPTION2])(
      {},
      'method',
      mock<TypedPropertyDescriptor<any>>(),
    );
    expect(ApiResponseSpy).toHaveBeenCalledWith({
      status: HttpStatus.NOT_FOUND,
      description: getReasonPhrase(HttpStatus.NOT_FOUND),
      content: {
        'application/json': {
          examples: {
            1: {
              description: 'desc',
              value: expect.objectContaining({
                ...EXCEPTION1().toJSON(),
                correlationId: expect.any(String),
              }),
            },
          },
          schema: generateSchema(ExceptionSchema),
        },
      },
    } satisfies ApiResponseOptions);
    expect(ApiResponseSpy).toHaveBeenCalledWith({
      status: HttpStatus.CONFLICT,
      description: getReasonPhrase(HttpStatus.CONFLICT),
      content: {
        'application/json': {
          examples: {
            2: {
              description: undefined,
              value: expect.objectContaining({
                ...EXCEPTION2('').toJSON(),
                correlationId: expect.any(String),
              }),
            },
          },
          schema: generateSchema(ExceptionSchema),
        },
      },
    } satisfies ApiResponseOptions);
    expect(ApiResponseSpy).toHaveBeenCalledTimes(2);
  });
});
