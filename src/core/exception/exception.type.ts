import type { HttpStatus } from '@nestjs/common';
import { z } from 'zod';

import type { Exception } from './exception.js';
import { ExceptionSchema } from './exception.schema.js';

export type ExceptionType = z.infer<typeof ExceptionSchema>;

export interface ExceptionArgs {
  errorCode: string;
  error: string;
  message?: string;
  status: HttpStatus;
  description?: string;
}

export interface ExceptionFactoryWithoutError {
  (): Exception;
}

export interface ExceptionFactoryWithError {
  (error: string): Exception;
}

export type ExceptionFactory =
  | ExceptionFactoryWithoutError
  | ExceptionFactoryWithError;
