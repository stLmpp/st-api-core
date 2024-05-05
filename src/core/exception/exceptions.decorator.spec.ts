import { HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { getReasonPhrase } from 'http-status-codes';
import { mock } from 'vitest-mock-extended';

import { generateSchema } from '../../common/generate-schema.js';

import { exception } from './exception.js';
import { ExceptionSchema } from './exception.schema.js';
import { Exceptions } from './exceptions.decorator.js';

vi.mock('@nestjs/swagger', async (importOriginal) => {
  const originalModule: object = await importOriginal();
  return {
    ...originalModule,
    ApiResponse: vi.fn().mockImplementation(() => vi.fn()),
  };
});

describe('exceptions.decorator', () => {
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

  it('should call ApiResponse', async () => {
    Exceptions([EXCEPTION1, EXCEPTION2])(
      {},
      'method',
      mock<TypedPropertyDescriptor<any>>(),
    );
    expect(ApiResponse).toHaveBeenCalledWith({
      status: HttpStatus.NOT_FOUND,
      description: getReasonPhrase(HttpStatus.NOT_FOUND),
      content: {
        'application/json': {
          examples: expect.objectContaining({
            1: {
              description: 'desc',
              value: expect.objectContaining({
                ...EXCEPTION1().toJSON(),
                correlationId: expect.any(String),
              }),
            },
          }),
          schema: generateSchema(ExceptionSchema),
        },
      },
    } satisfies ApiResponseOptions);
    expect(ApiResponse).toHaveBeenCalledWith({
      status: HttpStatus.CONFLICT,
      description: getReasonPhrase(HttpStatus.CONFLICT),
      content: {
        'application/json': {
          examples: expect.objectContaining({
            2: {
              description: undefined,
              value: expect.objectContaining({
                ...EXCEPTION2('').toJSON(),
                correlationId: expect.any(String),
              }),
            },
          }),
          schema: generateSchema(ExceptionSchema),
        },
      },
    } satisfies ApiResponseOptions);
  });
});
