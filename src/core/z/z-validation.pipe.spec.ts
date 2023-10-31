import { ArgumentMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mock } from 'vitest-mock-extended';
import { z } from 'zod';

import { BAD_REQUEST_BODY } from '../exception/core-exceptions.js';

import { zDto } from './z-dto.js';
import { ZValidationPipe } from './z-validation.pipe.js';

describe('z-validation.pipe', () => {
  let pipe: ZValidationPipe;

  beforeEach(async () => {
    vi.resetAllMocks();
    const ref = await Test.createTestingModule({
      providers: [ZValidationPipe],
    }).compile();
    pipe = ref.get(ZValidationPipe);
  });

  it('should create instance', () => {
    expect(pipe).toBeDefined();
  });

  it('should not transform if Paramtype is not supported', async () => {
    const meta = mock<ArgumentMetadata>({
      type: 'custom',
      metatype: class {},
    });
    const value = {};
    const transformed = await pipe.transform(value, meta);
    expect(transformed).toBe(value);
  });

  it('should not transform if metatype is not a ZDto', async () => {
    const meta = mock<ArgumentMetadata>({
      type: 'body',
      metatype: class {},
    });
    const value = {};
    const transformed = await pipe.transform(value, meta);
    expect(transformed).toBe(value);
  });

  it('should throw error if validation parsing fails', async () => {
    class Dto extends zDto(z.object({ id: z.number() })) {}
    const meta = mock<ArgumentMetadata>({
      type: 'body',
      metatype: Dto,
    });
    const value = {};
    await expect(() => pipe.transform(value, meta)).rejects.toThrowException(
      BAD_REQUEST_BODY('id: Required'),
    );
  });

  it('should return parsed data', async () => {
    class Dto extends zDto(z.object({ id: z.string().transform(Number) })) {}
    const meta = mock<ArgumentMetadata>({
      type: 'body',
      metatype: Dto,
    });
    const value = {
      id: '1',
    };
    const transformed = await pipe.transform(value, meta);
    expect(transformed).toEqual({ id: 1 });
  });
});
