import { ZHeadersMetadata } from '../decorator/z-headers.decorator.js';
import { validator } from 'hono/validator';
import { throwInternal } from '../throw-internal.js';
import { BAD_REQUEST_HEADERS } from '../exception/core-exceptions.js';
import { formatZodErrorString } from '../../common/zod-error-formatter.js';

export function createHeaderValidator(metadata: ZHeadersMetadata | undefined) {
  if (!metadata?.schema) {
    return validator('header', (value) => value);
  }
  const { schema } = metadata;
  return validator('header', async (value) => {
    const result = await schema.safeParseAsync(value);
    if (!result.success) {
      throwInternal(BAD_REQUEST_HEADERS(formatZodErrorString(result.error)));
    }
    return result.data;
  });
}
