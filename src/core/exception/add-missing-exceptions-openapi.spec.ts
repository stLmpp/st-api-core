import { HttpStatus } from '@nestjs/common';
import { OpenAPIObject, ResponseObject } from 'openapi3-ts/oas30';

import { addMissingExceptionsOpenapi } from './add-missing-exceptions-openapi.js';
import { OpenapiException } from './get-openapi-exceptions.js';

vi.mock('./get-openapi-exceptions.js', async (importFunction) => {
  const originalModule = await importFunction();
  return {
    ...(originalModule as any),
    getOpenapiExceptions: vi.fn().mockReturnValueOnce([
      {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
            examples: {
              ERROR: {
                value: {},
              },
            },
          },
        },
        description: 'description',
        status: HttpStatus.BAD_REQUEST,
      },
    ] satisfies OpenapiException[]),
  };
});

describe('add-missing-exceptions-openapi', () => {
  it('should add missing exceptions', () => {
    const document: OpenAPIObject = {
      info: {
        title: '',
        version: '',
      },
      openapi: '3.0.0',
      paths: {
        '/': {
          get: {
            responses: {},
          },
        },
      },
    };
    addMissingExceptionsOpenapi(document);
    expect(document).toEqual({
      info: {
        title: '',
        version: '',
      },
      openapi: '3.0.0',
      paths: {
        '/': {
          get: {
            responses: {
              [HttpStatus.BAD_REQUEST]: {
                description: 'description',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                    examples: {
                      ERROR: {
                        value: {},
                      },
                    },
                  },
                },
              } satisfies ResponseObject,
            },
          },
        },
      },
    } satisfies OpenAPIObject);
  });
});
