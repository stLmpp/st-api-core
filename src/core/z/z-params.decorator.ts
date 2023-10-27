import { Param } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { ZodObject, type ZodType } from 'zod';

import { generateSchema } from '../../common/generate-schema.js';

import { getZDto, Z_DTO_SCHEMA } from './z-dto.js';

/**
 * Decorator that applies parameter validation based on a ZodObject schema.
 */
export function ZParams(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const type = getZDto(target, propertyKey!, parameterIndex);
    const schema = type[Z_DTO_SCHEMA];
    if (!(schema instanceof ZodObject)) {
      throw new TypeError(
        `${type.name} cannot be used in the Params decorator because it's not a ZodObject`,
      );
    }
    const schemaObject: ZodObject<Record<string, ZodType>> = schema;
    Param()(target, propertyKey, parameterIndex);
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
