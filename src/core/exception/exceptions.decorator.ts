import { ApiResponse } from '@nestjs/swagger';

import { ExceptionFactory } from './exception.type.js';
import { getOpenapiExceptions } from './get-openapi-exceptions.js';

export function Exceptions(factories: ExceptionFactory[]): MethodDecorator {
  const exceptions = getOpenapiExceptions(factories);
  return (target, propertyKey, descriptor) => {
    for (const exception of exceptions) {
      ApiResponse(exception)(target, propertyKey, descriptor);
    }
  };
}
