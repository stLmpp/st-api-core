import { HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { z, ZodSchema, ZodVoid } from 'zod';

import { coerceArray } from '../../common/coerce-array.js';
import { generateSchema } from '../../common/generate-schema.js';

import { isZodDto, ZOD_DTO_SCHEMA, ZodDto } from './zod-dto.js';
import { zodInterceptorFactory } from './zod-interceptor.factory.js';

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
  return (target, propertyKey, descriptor) => {
    dto ??= z.void();
    const isArray = Array.isArray(dto);
    const [single] = coerceArray(dto);
    // non-null assertion is safe here, because coerceArray
    // will always return an array with at least one item
    const schema =
      single instanceof ZodVoid ? single : getSchemaFromZodDto(single!);
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
    UseInterceptors(zodInterceptorFactory(schema))(
      target,
      propertyKey,
      descriptor,
    );
  };
}
