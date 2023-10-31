import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { type Paramtype } from '@nestjs/common/interfaces/features/paramtype.interface.js';
import { ZodSchema } from 'zod';

import { formatZodErrorString } from '../../common/zod-error-formatter.js';
import {
  BAD_REQUEST_BODY,
  BAD_REQUEST_PARAMS,
  BAD_REQUEST_QUERY,
} from '../exception/core-exceptions.js';
import type { ExceptionFactoryWithError } from '../exception/exception.type.js';

@Injectable()
export class ZValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  private readonly PARAM_TYPES: ReadonlySet<Paramtype> = new Set<Paramtype>([
    'param',
    'body',
    'query',
  ]);

  private readonly NEST_Z_PIPE_EXCEPTIONS: Record<
    Exclude<Paramtype, 'custom'>,
    ExceptionFactoryWithError
  > = {
    body: BAD_REQUEST_BODY,
    param: BAD_REQUEST_PARAMS,
    query: BAD_REQUEST_QUERY,
  };

  private isParamTypeSupported(
    type: Paramtype,
  ): type is Exclude<Paramtype, 'custom'> {
    return this.PARAM_TYPES.has(type);
  }

  async transform(
    value: unknown,
    { type }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!this.isParamTypeSupported(type)) {
      return value;
    }
    const parsed = await this.schema.safeParseAsync(value);
    if (!parsed.success) {
      const exceptionFactory = this.NEST_Z_PIPE_EXCEPTIONS[type];
      throw exceptionFactory(formatZodErrorString(parsed.error));
    }
    return parsed.data;
  }
}
