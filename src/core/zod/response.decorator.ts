import { HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { z, ZodSchema, ZodVoid } from 'zod';

import { coerceArray } from '../../common/coerce-array.js';
import { generateSchema } from '../../common/generate-schema.js';
import { RESPONSE_SCHEMA_METADATA } from '../metadata.js';

import { isZodDto, ZOD_DTO_SCHEMA, ZodDto } from './zod-dto.js';

/**
 * Retrieves the ZodSchema from a ZodDto.
 *
 * @param dto - The ZodDto object from which to retrieve the ZodSchema.
 * @throws {Error} Throws an error if the provided dto is not a ZodDto.
 */
function getSchemaFromZodDto(dto: ZodDto): ZodSchema {
  if (!isZodDto(dto)) {
    throw new Error(`${String(dto)} is not a ZodDto`);
  }
  return dto[ZOD_DTO_SCHEMA];
}

/**
 * Decorator that adds response information to a method.
 *
 * @param [dto] - The data transfer object schema or array of schemas. Defaults to void schema.
 * @param [status=HttpStatus.OK] - The HTTP status code.
 */
export function Response<T extends ZodSchema>(
  dto?: ZodDto<T> | ZodDto<T>[] | ZodVoid,
  status = HttpStatus.OK,
): MethodDecorator {
  return (target, propertyKey, descriptor: TypedPropertyDescriptor<any>) => {
    dto ??= z.void();
    const isArray = Array.isArray(dto);
    const [single] = coerceArray(dto);
    // non-null assertion is safe here, because coerceArray
    // will always return an array with at least one item
    const singleSchema =
      single instanceof ZodVoid ? single : getSchemaFromZodDto(single!);
    const schema = isArray ? z.array(singleSchema) : singleSchema;
    Reflect.defineMetadata(RESPONSE_SCHEMA_METADATA, schema, descriptor.value);
    HttpCode(status)(target, propertyKey, descriptor);
    ApiResponse({
      content: {
        'application/json': {
          schema: generateSchema(schema, true),
        },
      },
      status,
      isArray,
    })(target, propertyKey, descriptor);
  };
}
