import type {
  OpenAPIObject,
  OperationObject,
  ResponseObject,
} from 'openapi3-ts/oas30';

import { OpenapiException } from './get-openapi-exceptions.js';

const METHODS_ARRAY = ['get', 'post', 'put', 'patch', 'delete'] as const;

/**
 * @param operation - The operation object to add missing exceptions to.
 * @param exceptions
 * @description
 * This function adds missing exceptions to the provided operation object.
 * It iterates through the CORE_EXCEPTIONS and checks if each exception status is already present in the operation's responses.
 * If the status is not present, it creates a new response object and sets the necessary fields.
 * If the status is already present, it checks if any of the necessary fields are missing and sets them if they are.
 * The function ensures that the operation object contains all the required exceptions with their respective response properties.
 */
function addMissingExceptionsToOperation(
  operation: OperationObject,
  exceptions: OpenapiException[],
) {
  for (const exception of exceptions) {
    operation.responses[exception.status] ??= {};
    const response: ResponseObject = operation.responses[exception.status];
    response.description ??= exception.description;
    response.content ??= {};
    response.content['application/json'] ??= {};
    response.headers ??= exception.headers;
    const content = response.content['application/json'];
    content.schema ??= exception.content['application/json'].schema;
    content.examples ??= {};
    const examples = exception.content['application/json'].examples;
    for (const [key, example] of Object.entries(examples)) {
      content.examples[key] ??= example;
    }
  }
}

/**
 * @param document - The OpenAPI document to add missing exceptions to.
 * @param exceptions
 * @description Add Core exceptions as examples to all end-points.
 * It does mutate the document.
 * @return
 */
export function addMissingExceptionsOpenapi(
  document: OpenAPIObject,
  exceptions: OpenapiException[],
): void {
  for (const path of Object.values(document.paths)) {
    for (const method of METHODS_ARRAY) {
      const operation = path[method];
      if (!operation) {
        continue;
      }
      operation.responses ??= {};
      addMissingExceptionsToOperation(operation, exceptions);
    }
  }
}
