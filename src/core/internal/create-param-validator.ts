import { ZParamsMetadata } from '../decorator/z-params.decorator.js';
import { validator } from 'hono/validator';
import { throwInternal } from '../throw-internal.js';
import { BAD_REQUEST_PARAMS } from '../exception/core-exceptions.js';
import { formatZodErrorString } from '../../common/zod-error-formatter.js';

export function createParamValidator(metadata: ZParamsMetadata | undefined) {
  if (!metadata?.schema) {
    return validator('param', (value) => value);
  }
  const { schema } = metadata;
  return validator('param', async (value) => {
    const result = await schema.safeParseAsync(value);
    if (!result.success) {
      throwInternal(BAD_REQUEST_PARAMS(formatZodErrorString(result.error)));
    }
    return result.data;
  });
}
