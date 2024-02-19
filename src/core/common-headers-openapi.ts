import type { HeadersObject } from 'openapi3-ts/oas30';

export const COMMON_HEADERS_OPENAPI = {
  'x-correlation-id': {
    schema: {
      type: 'string',
      example: '66811850-87e9-493b-b956-0b563e69297d',
    },
    // TODO add description
  },
  'x-trace-id': {
    schema: {
      type: 'string',
      example: '66811850-87e9-493b-b956-0b563e69297d',
    },
    // TODO add description
  },
} as const satisfies HeadersObject;
