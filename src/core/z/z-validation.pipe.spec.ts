import { ArgumentMetadata } from '@nestjs/common';
import { mock } from 'vitest-mock-extended';
import { z } from 'zod';

import { BAD_REQUEST_BODY } from '../exception/core-exceptions.js';

import { ZValidationPipe } from './z-validation.pipe.js';

describe('z-validation.pipe', () => {
  it('should not transform if Paramtype is not supported', async () => {
    const meta = mock<ArgumentMetadata>({
      type: 'custom',
    });
    const pipe = new ZValidationPipe(z.void());
    const value = {};
    const transformed = await pipe.transform(value, meta);
    expect(transformed).toBe(value);
  });

  it('should throw error if validation parsing fails', async () => {
    const pipe = new ZValidationPipe(z.object({ id: z.number() }));
    const meta = mock<ArgumentMetadata>({
      type: 'body',
    });
    const value = {};
    await expect(() => pipe.transform(value, meta)).rejects.toThrowException(
      BAD_REQUEST_BODY('id: Required'),
    );
  });

  it('should return parsed data', async () => {
    const pipe = new ZValidationPipe(
      z.object({ id: z.string().transform(Number) }),
    );
    const meta = mock<ArgumentMetadata>({
      type: 'body',
    });
    const value = {
      id: '1',
    };
    const transformed = await pipe.transform(value, meta);
    expect(transformed).toEqual({ id: 1 });
  });
});
