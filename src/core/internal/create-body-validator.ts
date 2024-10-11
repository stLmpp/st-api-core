import { ZBodyMetadata } from '../decorator/z-body.decorator.js';
import { validator } from 'hono/validator';
import { throwInternal } from '../throw-internal.js';
import { BAD_REQUEST_BODY } from '../exception/core-exceptions.js';
import { formatZodErrorString } from '../../common/zod-error-formatter.js';

export function createBodyValidator(metadata: ZBodyMetadata | undefined) {
  if (!metadata?.schema) {
    return validator('json', (value) => value);
  }
  const { schema } = metadata;
  return validator('json', async (value) => {
    const result = await schema.safeParseAsync(value);
    if (!result.success) {
      throwInternal(BAD_REQUEST_BODY(formatZodErrorString(result.error)));
    }
    return result.data;
  });
}
