import { Param } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { ZodObject, ZodSchema, type ZodType } from 'zod';

import { generateSchema } from '../../common/generate-schema.js';

import { getZDtoSchema } from './z-dto.js';
import { ZValidationPipe } from './z-validation.pipe.js';

/**
 * Decorator that applies parameter validation based on a ZodObject schema.
 */
export function ZParams(schema?: ZodSchema): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    schema ??= getZDtoSchema(target, propertyKey!, parameterIndex);
    if (!(schema instanceof ZodObject)) {
      throw new TypeError(
        'Only ZodObject can be used in the ZParams decorator',
      );
    }
    const schemaObject: ZodObject<Record<string, ZodType>> = schema;
    Param(new ZValidationPipe(schemaObject))(
      target,
      propertyKey,
      parameterIndex,
    );
    const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey!);
    for (const [key, value] of Object.entries(schemaObject.shape)) {
      ApiParam({
        schema: generateSchema(value),
        name: key,
        required: !value.isOptional(),
      })(target, propertyKey!, descriptor!);
    }
  };
}
