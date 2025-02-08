import { z } from 'zod';

import type { Exception } from './exception.js';
import { ExceptionSchema } from './exception.schema.js';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export type ExceptionType = z.infer<typeof ExceptionSchema>;

export interface ExceptionArgs {
  errorCode: string;
  error: string;
  message?: string;
  status: ContentfulStatusCode;
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
