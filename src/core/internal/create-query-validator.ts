import { ZQueryMetadata } from '../decorator/z-query.decorator.js';
import { validator } from 'hono/validator';
import { throwInternal } from '../throw-internal.js';
import { BAD_REQUEST_QUERY } from '../exception/core-exceptions.js';
import { formatZodErrorString } from '../../common/zod-error-formatter.js';

export function createQueryValidator(metadata: ZQueryMetadata | undefined) {
  if (!metadata?.schema) {
    return validator('query', (value) => value);
  }
  const { schema } = metadata;
  return validator('query', async (value) => {
    const result = await schema.safeParseAsync(value);
    if (!result.success) {
      throwInternal(BAD_REQUEST_QUERY(formatZodErrorString(result.error)));
    }
    return result.data;
  });
}
