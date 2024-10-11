import type {
  OpenAPIObject,
  OperationObject,
  ResponseObject,
} from 'openapi3-ts/oas30';
import { ControllerFullMetadata } from './get-controller-full-metadata.js';
import { generateSchema } from '@st-api/zod-openapi';
import { getReasonPhrase } from 'http-status-codes';
import { addMissingExceptionsOpenapi } from './exception/add-missing-exceptions-openapi.js';
import { getOpenapiExceptions } from './exception/get-openapi-exceptions.js';

export class Openapi {
  constructor(document: OpenAPIObject) {
    this.#document = document;
  }

  #document: OpenAPIObject;

  addPath({
    controller,
    params,
    body,
    query,
    headers,
    response,
    exceptions,
  }: ControllerFullMetadata): this {
    let path = controller.path ?? '/';
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    const method = controller.method ?? 'GET';
    const pathOpenapi = path
      .split('/')
      .map((part) => {
        if (!part.startsWith(':')) {
          return part;
        }
        return `{${part.slice(1)}}`;
      })
      .join('/');
    const pathOperationId = path.replaceAll('/', '_').replaceAll(':', 'p~');
    const operation: OperationObject = {
      responses: {},
      operationId: `${method}-${pathOperationId}`,
    };
    this.#document.paths[pathOpenapi] = Object.assign(
      this.#document.paths[pathOpenapi] ?? {},
      { [method.toLowerCase()]: operation },
    );
    if (body?.schema) {
      operation.requestBody = {
        required: !body.schema.isOptional(),
        content: {
          'application/json': {
            schema: generateSchema(body.schema),
          },
        },
      };
    }
    operation.parameters ??= [];
    if (params?.schema) {
      for (const [key, value] of Object.entries(params.schema.shape)) {
        operation.parameters.push({
          name: key,
          required: !value.isOptional(),
          in: 'query',
          schema: generateSchema(value),
        });
      }
    }
    if (query?.schema) {
      for (const [key, value] of Object.entries(query.schema.shape)) {
        operation.parameters.push({
          name: key,
          required: !value.isOptional(),
          in: 'path',
          schema: generateSchema(value),
        });
      }
    }
    if (headers?.schema) {
      for (const [key, value] of Object.entries(headers.schema.shape)) {
        operation.parameters.push({
          name: key,
          required: !value.isOptional(),
          in: 'header',
          schema: generateSchema(value),
        });
      }
    }
    if (response) {
      operation.responses[response.statusCode] = {
        description: getReasonPhrase(response.statusCode),
        content: {
          'application/json': {
            schema: generateSchema(response.schema),
          },
        },
      } satisfies ResponseObject;
    }
    if (exceptions?.factories.length) {
      for (const exception of getOpenapiExceptions(exceptions.factories)) {
        operation.responses[exception.status] = exception;
      }
    }
    return this;
  }

  addMissingExceptions() {
    addMissingExceptionsOpenapi(this.#document, getOpenapiExceptions([]));
  }

  build(builder: (document: OpenAPIObject) => OpenAPIObject): this {
    this.#document = builder(this.#document);
    return this;
  }

  getDocument(): OpenAPIObject {
    return this.#document;
  }
}
