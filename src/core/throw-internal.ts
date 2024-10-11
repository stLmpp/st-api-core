import { HTTPException } from 'hono/http-exception';
import { Exception } from './exception/exception.js';
import { UNKNOWN_INTERNAL_SERVER_ERROR } from './exception/core-exceptions.js';

export function throwInternal(error: unknown): never {
  const exception =
    error instanceof Exception ? error : UNKNOWN_INTERNAL_SERVER_ERROR();
  throw new HTTPException(exception.status, {
    res: new Response(JSON.stringify(exception.toJSON()), {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  });
}
