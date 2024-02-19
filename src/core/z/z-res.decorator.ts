// eslint-disable-next-line unicorn/prevent-abbreviations
import { HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator.js';
import { getReasonPhrase } from 'http-status-codes';
import { z, ZodSchema, ZodVoid } from 'zod';

import { coerceArray } from '../../common/coerce-array.js';
import { generateSchema } from '../../common/generate-schema.js';
import { COMMON_HEADERS_OPENAPI } from '../common-headers-openapi.js';
import { RESPONSE_SCHEMA_METADATA } from '../metadata.js';

import { isZDto, Z_DTO_SCHEMA, type ZDto } from './z-dto.js';

/**
 * Retrieves the ZodSchema from a ZDto.
 *
 * @param dto - The ZDto object from which to retrieve the ZodSchema.
 * @throws {Error} Throws an error if the provided dto is not a ZDto.
 */
function getSchemaFromZDto(dto: ZDto): ZodSchema {
  if (!isZDto(dto)) {
    throw new Error(`${String(dto)} is not a ZodDto`);
  }
  return dto[Z_DTO_SCHEMA];
}

/**
 * Decorator that adds response information to a method.
 *
 * @param [dto] - The data transfer object schema or array of schemas. Default to void schema.
 * @param [status=HttpStatus.OK] - The HTTP status code.
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
export function ZRes<T extends ZodSchema>(
  dto: ZDto<T> | [ZDto<T>] | ZodSchema = z.void(),
  status = HttpStatus.OK,
): MethodDecorator {
  return (target, propertyKey, descriptor: TypedPropertyDescriptor<any>) => {
    const isArray = Array.isArray(dto);
    const [single] = coerceArray(dto);
    const isZodSchema = single instanceof ZodSchema;
    // non-null assertion is safe here, because coerceArray
    // will always return an array with at least one item
    const singleSchema = isZodSchema ? single : getSchemaFromZDto(single!);
    const schema = isArray ? z.array(singleSchema) : singleSchema;

    Reflect.defineMetadata(RESPONSE_SCHEMA_METADATA, schema, descriptor.value);

    const apiResponseOptions: ApiResponseOptions = {
      description: getReasonPhrase(status),
      status,
      headers: COMMON_HEADERS_OPENAPI,
    };
    const isVoidSchema = singleSchema instanceof ZodVoid;
    if (!isVoidSchema) {
      apiResponseOptions.content = {
        'application/json': {
          schema: generateSchema(schema, true),
        },
      };
    }
    HttpCode(status)(target, propertyKey, descriptor);
    ApiResponse(apiResponseOptions)(target, propertyKey, descriptor);
  };
}
