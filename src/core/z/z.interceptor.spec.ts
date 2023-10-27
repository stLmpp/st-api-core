import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { mock } from 'vitest-mock-extended';
import { z } from 'zod';

import { INVALID_RESPONSE } from '../exception/core-exceptions.js';

import { ZInterceptor } from './z.interceptor.js';

describe('z.interceptor', () => {
  let interceptor: ZInterceptor;

  const reflectorMock = mock<Reflector>({
    get: vi.fn(),
  });

  beforeEach(async () => {
    const ref = await Test.createTestingModule({
      providers: [
        ZInterceptor,
        {
          provide: Reflector,
          useFactory: () => reflectorMock,
        },
      ],
    }).compile();
    interceptor = ref.get(ZInterceptor);
  });

  it('should create instance', () => {
    expect(interceptor).toBeDefined();
  });

  it.each([undefined, {}, [], 'string', 1, Number.NaN, true])(
    'should only return data if schema is not a ZodSchema (%s)',
    (value) => {
      vi.spyOn(reflectorMock, 'get').mockReturnValueOnce(value);
      interceptor
        .intercept(
          mock<ExecutionContext>(),
          mock<CallHandler>({
            handle: vi.fn().mockReturnValueOnce(of({})),
          }),
        )
        .subscribe((data) => {
          expect(data).toEqual({});
        });
    },
  );

  it('should validate data (exception)', () => {
    vi.spyOn(reflectorMock, 'get').mockReturnValueOnce(
      z.object({
        id: z.number(),
      }),
    );
    interceptor
      .intercept(
        mock<ExecutionContext>(),
        mock<CallHandler>({
          handle: vi.fn().mockReturnValueOnce(of({})),
        }),
      )
      .subscribe({
        error: (error) => {
          expect(error).toThrowException(INVALID_RESPONSE('id: Required'));
        },
      });
  });

  it('should validate data (success)', () => {
    vi.spyOn(reflectorMock, 'get').mockReturnValueOnce(
      z.object({
        id: z.number(),
      }),
    );
    interceptor
      .intercept(
        mock<ExecutionContext>(),
        mock<CallHandler>({
          handle: vi.fn().mockReturnValueOnce(
            of({
              id: 1,
              name: 'string',
            }),
          ),
        }),
      )
      .subscribe({
        next: (value) => {
          expect(value).toEqual({ id: 1 });
        },
      });
  });
});
