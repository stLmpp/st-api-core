import { randomUUID } from 'node:crypto';

import { getReasonPhrase } from 'http-status-codes';
import { ExamplesObject } from 'openapi3-ts/oas31';

import { arrayUniqBy } from '../../common/array-uniq-by.js';
import { generateSchema } from '../../common/generate-schema.js';

import * as CoreExceptions from './core-exceptions.js';
import { Exception } from './exception.js';
import { ExceptionFactory } from './exception.type.js';
import { ExceptionSchema } from './exceptions.schema.js';

const CORRELATION_ID_EXAMPLE = randomUUID();
const EXCEPTION_OPENAPI_SCHEMA = generateSchema(ExceptionSchema);
const CORE_EXCEPTIONS = Object.values(CoreExceptions);

interface OpenapiException {
  status: number;
  description: string;
  content: {
    'application/json': {
      schema: any;
      examples: ExamplesObject;
    };
  };
}

export function getOpenapiExceptions(
  exceptionsOrFactories: Array<ExceptionFactory | Exception>,
): OpenapiException[] {
  const exceptions = [...exceptionsOrFactories, ...CORE_EXCEPTIONS].map(
    (exceptionOrFactory) =>
      exceptionOrFactory instanceof Exception
        ? exceptionOrFactory
        : exceptionOrFactory(''),
  );
  const statusList = arrayUniqBy(exceptions, (exception) =>
    exception.getStatus(),
  ).map((exception) => exception.getStatus());
  return statusList.map((status) => {
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
    return {
      status,
      content: {
        'application/json': {
          schema: EXCEPTION_OPENAPI_SCHEMA,
          examples,
        },
      },
      description: getReasonPhrase(status),
    };
  });
}
