import { applyDecorators } from '@nestjs/common';
import { Throttle as NestThrottle } from '@nestjs/throttler';
import { THROTTLER_KEY } from './throttler.constant.js';

export interface ThrottleOptions {
  ttl?: number;
  limit?: number;
}

export function Throttle({
  ttl,
  limit,
}: ThrottleOptions): MethodDecorator & ClassDecorator {
  return applyDecorators(
    NestThrottle({
      [THROTTLER_KEY]: {
        ttl,
        limit,
      },
    }),
  );
}
