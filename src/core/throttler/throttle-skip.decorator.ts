import { applyDecorators } from '@nestjs/common';
import { SkipThrottle as NestSkipThrottle } from '@nestjs/throttler';
import { THROTTLER_KEY } from './throttler.constant.js';

export function SkipThrottle(): MethodDecorator | ClassDecorator {
  return applyDecorators(
    NestSkipThrottle({
      [THROTTLER_KEY]: true,
    }),
  );
}
