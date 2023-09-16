import { HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { z, ZodSchema } from 'zod';

import { generateSchema } from '../../common/generate-schema.js';
import { coerceArray } from '../../common/index.js';

import { ZOD_DTO_SCHEMA, ZodDto, ZodDtoInternal } from './zod-dto.js';
import { zodInterceptorFactory } from './zod-interceptor.factory.js';

export function Response<T extends ZodSchema>(
  dto: ZodDto<T> | ZodDto<T>[],
  status = HttpStatus.OK,
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const isArray = Array.isArray(dto);
    const single = coerceArray(dto)[0];
    const schema = (single as ZodDtoInternal)[ZOD_DTO_SCHEMA];
    const fullSchema = isArray ? z.array(schema) : schema;
    HttpCode(status);
    ApiResponse({
      content: {
        'application/json': {
          schema: generateSchema(schema, true),
        },
      },
      status,
      isArray,
    })(target, propertyKey, descriptor);
    UseInterceptors(zodInterceptorFactory(fullSchema))(
      target,
      propertyKey,
      descriptor,
    );
  };
}
