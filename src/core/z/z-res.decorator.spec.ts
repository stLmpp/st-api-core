// eslint-disable-next-line unicorn/prevent-abbreviations
import { HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { getReasonPhrase } from 'http-status-codes';
import { mock } from 'vitest-mock-extended';
import { z } from 'zod';

import { zDto } from './z-dto.js';
// eslint-disable-next-line unicorn/prevent-abbreviations
import { ZRes } from './z-res.decorator.js';

vi.mock('@nestjs/swagger', async (importOriginal) => {
  const originalModule: object = await importOriginal();
  return {
    ...originalModule,
    ApiResponse: vi.fn().mockReturnValue(vi.fn()),
  };
});
vi.mock('@nestjs/common', async (importOriginal) => {
  const originalModule: object = await importOriginal();
  return {
    ...originalModule,
    HttpCode: vi.fn().mockReturnValue(vi.fn()),
  };
});

describe('z-res', () => {
  const targetMock = vi.fn();
  const propertyKeyMock = 'key';
  const descriptorMock = mock<TypedPropertyDescriptor<any>>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should work with single ZDto', () => {
    class Dto extends zDto(
      z.object({
        id: z.number(),
      }),
    ) {}

    ZRes(Dto)(targetMock, propertyKeyMock, descriptorMock);

    expect(ApiResponse).toHaveBeenCalledWith({
      status: HttpStatus.OK,
      description: getReasonPhrase(HttpStatus.OK),
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                type: 'number',
              },
            },
          },
        },
      },
    } satisfies Parameters<typeof ApiResponse>[0]);
    expect(HttpCode).toHaveBeenCalledWith(HttpStatus.OK);
  });

  it('should work with [ZDto]', () => {
    class Dto extends zDto(
      z.object({
        id: z.number(),
      }),
    ) {}

    ZRes([Dto])(targetMock, propertyKeyMock, descriptorMock);

    expect(ApiResponse).toHaveBeenCalledWith({
      status: HttpStatus.OK,
      description: getReasonPhrase(HttpStatus.OK),
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id'],
              properties: {
                id: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    } satisfies Parameters<typeof ApiResponse>[0]);
    expect(HttpCode).toHaveBeenCalledWith(HttpStatus.OK);
  });

  it('should work with ZodSchema (object)', () => {
    ZRes(
      z.object({
        id: z.number(),
      }),
    )(targetMock, propertyKeyMock, descriptorMock);

    expect(ApiResponse).toHaveBeenCalledWith({
      status: HttpStatus.OK,
      description: getReasonPhrase(HttpStatus.OK),
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                type: 'number',
              },
            },
          },
        },
      },
    } satisfies Parameters<typeof ApiResponse>[0]);
    expect(HttpCode).toHaveBeenCalledWith(HttpStatus.OK);
  });

  it('should work with ZodSchema (array)', () => {
    ZRes(
      z
        .object({
          id: z.number(),
        })
        .array(),
    )(targetMock, propertyKeyMock, descriptorMock);

    expect(ApiResponse).toHaveBeenCalledWith({
      status: HttpStatus.OK,
      description: getReasonPhrase(HttpStatus.OK),
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id'],
              properties: {
                id: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    } satisfies Parameters<typeof ApiResponse>[0]);
    expect(HttpCode).toHaveBeenCalledWith(HttpStatus.OK);
  });
});
