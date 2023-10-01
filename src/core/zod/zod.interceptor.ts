import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, switchMap } from 'rxjs';
import { ZodSchema } from 'zod';

import { formatZodErrorString } from '../../common/zod-error-formatter.js';
import { INVALID_RESPONSE } from '../exception/core-exceptions.js';
import { RESPONSE_SCHEMA_METADATA } from '../metadata.js';

@Injectable()
export class ZodInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = context.getHandler();
    const schema = this.reflector.get<ZodSchema | undefined>(
      RESPONSE_SCHEMA_METADATA,
      handler,
    );
    const isZodSchema = schema instanceof ZodSchema;
    return next.handle().pipe(
      switchMap(async (data) => {
        if (!isZodSchema) {
          return data;
        }
        const result = await schema.safeParseAsync(data);
        if (!result.success) {
          throw INVALID_RESPONSE(formatZodErrorString(result.error));
        }
        return result.data;
      }),
    );
  }
}
