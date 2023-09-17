import { randomUUID } from 'node:crypto';

import { ApiResponse } from '@nestjs/swagger';
import { getReasonPhrase } from 'http-status-codes';
import { ExamplesObject } from 'openapi3-ts/oas31';

import { generateSchema } from '../../common/generate-schema.js';
import { arrayUniqBy } from '../../common/index.js';

import * as CoreExceptions from './core-exceptions.js';
import { ExceptionFactory } from './exception.type.js';
import { ExceptionSchema } from './exceptions.schema.js';

const CORRELATION_ID_EXAMPLE = randomUUID();

const CORE_EXCEPTIONS = Object.values(CoreExceptions);
const EXCEPTION_OPENAPI_SCHEMA = generateSchema(ExceptionSchema);

export function Exceptions(factories: ExceptionFactory[]): MethodDecorator {
  const exceptions = [...factories, ...CORE_EXCEPTIONS].map((exception) =>
    exception(''),
  );
  return (target, propertyKey, descriptor) => {
    const statusList = arrayUniqBy(exceptions, (exception) =>
      exception.getStatus(),
    ).map((exception) => exception.getStatus());
    for (const status of statusList) {
      const exceptionsStatus = exceptions.filter(
        (exception) => exception.getStatus() === status,
      );
      const examples: ExamplesObject = {};
      for (const exception of exceptionsStatus) {
        examples[exception.errorCode] = {
          value: {
            ...exception.toJSON(),
            correlationId: CORRELATION_ID_EXAMPLE,
          },
          description: exception.description,
        };
      }
      ApiResponse({
        status,
        content: {
          'application/json': {
            schema: EXCEPTION_OPENAPI_SCHEMA,
            examples,
          },
        },
        description: getReasonPhrase(status),
      })(target, propertyKey, descriptor);
    }
  };
}
