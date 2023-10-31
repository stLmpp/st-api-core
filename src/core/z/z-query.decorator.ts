import { Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ZodObject, ZodSchema, type ZodType } from 'zod';

import { generateSchema } from '../../common/generate-schema.js';

import { getZDtoSchema } from './z-dto.js';

/**
 * Decorator for query parameters.
 */
export function ZQuery(schema?: ZodSchema): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    schema ??= getZDtoSchema(target, propertyKey!, parameterIndex);
    if (!(schema instanceof ZodObject)) {
      throw new TypeError('Only ZodObject can be used in the ZQuery decorator');
    }
    const schemaObject: ZodObject<Record<string, ZodType>> = schema;
    Query()(target, propertyKey, parameterIndex);
    const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey!);
    for (const [key, value] of Object.entries(schemaObject.shape)) {
      ApiQuery({
        schema: generateSchema(value),
        name: key,
        required: !value.isOptional(),
      })(target, propertyKey!, descriptor!);
    }
  };
}
