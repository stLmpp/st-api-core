import { Test } from '@nestjs/testing';

import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('zod-validation.pipe', () => {
  let pipe: ZodValidationPipe;

  beforeEach(async () => {
    vi.resetAllMocks();
    const ref = await Test.createTestingModule({
      providers: [ZodValidationPipe],
    }).compile();
    pipe = ref.get(ZodValidationPipe);
  });

  it('should create instance', () => {
    expect(pipe).toBeDefined();
  });
});
