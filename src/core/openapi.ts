import type {
  OpenAPIObject,
  OperationObject,
  ResponseObject,
  SchemaObject,
} from 'openapi3-ts/oas30';
import { ControllerFullMetadata } from './get-controller-full-metadata.js';
import { getReasonPhrase } from 'http-status-codes';
import { addMissingExceptionsOpenapi } from './exception/add-missing-exceptions-openapi.js';
import { getOpenapiExceptions } from './exception/get-openapi-exceptions.js';
import { ExceptionFactory } from './exception/exception.type.js';
import { Exception } from './exception/exception.js';
import { ZodType, ZodUndefined, ZodVoid } from 'zod/v4';
import { zodIsOptional, zodToJSONSchema } from '../common/zod-util.js';

export class Openapi {
  constructor(document: OpenAPIObject) {
    this.#document = document;
  }

  readonly #voidResponses = [ZodVoid, ZodUndefined] as const;

  #document: OpenAPIObject;

  #getResponseSchema(schema: ZodType): SchemaObject | undefined {
    const isVoid = this.#voidResponses.some(
      (voidSchema) => schema instanceof voidSchema,
    );
    return isVoid ? undefined : zodToJSONSchema(schema);
  }

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
      ...controller.openapi,
      responses: {},
      operationId: `${method}-${pathOperationId}`,
    };
    this.#document.paths[pathOpenapi] = Object.assign(
      this.#document.paths[pathOpenapi] ?? {},
      { [method.toLowerCase()]: operation },
    );
    if (body?.schema) {
      operation.requestBody = {
        required: !zodIsOptional(body.schema),
        content: {
          'application/json': {
            schema: zodToJSONSchema(body.schema),
          },
        },
      };
    }
    operation.parameters ??= [];
    if (params?.schema) {
      for (const [key, value] of Object.entries(params.schema.shape)) {
        operation.parameters.push({
          name: key,
          required: !zodIsOptional(value),
          in: 'path',
          schema: zodToJSONSchema(value),
        });
      }
    }
    if (query?.schema) {
      for (const [key, value] of Object.entries(query.schema.shape)) {
        operation.parameters.push({
          name: key,
          required: !zodIsOptional(value),
          in: 'query',
          schema: zodToJSONSchema(value),
        });
      }
    }
    if (headers?.schema) {
      for (const [key, value] of Object.entries(headers.schema.shape)) {
        operation.parameters.push({
          name: key,
          required: !zodIsOptional(value),
          in: 'header',
          schema: zodToJSONSchema(value),
        });
      }
    }
    if (response) {
      const responseSchema = this.#getResponseSchema(response.schema);
      operation.responses[response.statusCode] = {
        description: getReasonPhrase(response.statusCode),
        content: responseSchema && {
          'application/json': {
            schema: responseSchema,
          },
        },
      } satisfies ResponseObject;
    }
    for (const exception of getOpenapiExceptions(exceptions?.factories ?? [])) {
      if (!exception.status) {
        continue;
      }
      operation.responses[exception.status] = Object.assign(exception, {
        status: undefined,
      });
    }
    return this;
  }

  addMissingExceptions(exceptions?: Array<ExceptionFactory | Exception>) {
    addMissingExceptionsOpenapi(
      this.#document,
      getOpenapiExceptions(exceptions ?? []),
    );
  }

  build(builder: (document: OpenAPIObject) => OpenAPIObject): this {
    this.#document = builder(this.#document);
    return this;
  }

  getDocument(): OpenAPIObject {
    return this.#document;
  }
}
