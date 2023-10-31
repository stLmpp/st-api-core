import { Body } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ZodSchema } from 'zod';

import { generateSchema } from '../../common/generate-schema.js';

import { getZDtoSchema } from './z-dto.js';
import { ZValidationPipe } from './z-validation.pipe.js';

/**
 * Decorator to specify the request body type for a method.
 * This decorator is used to define the type of the request body for a method.
 * It internally uses `NestBody` decorator from the NestJS framework
 * and `ApiBody` decorator from the Swagger module.
 *
 * @returns {ParameterDecorator} The decorator function.
 *
 * @remarks
 * This decorator should be applied to a method parameter.
 *
 * @example
 * ```
 * class UserController {
 *   @Post('/')
 *   @ZBody()
 *   createUser(@ZBody() createUserDto: CreateUserDto) {
 *     // implementation here
 *   }
 * }
 * ```
 *
 * @see [NestBody](https://docs.nestjs.com/controllers#body)
 * @see [ApiBody](https://docs.nestjs/swagger/modules#api-body)
 */
export function ZBody(schema?: ZodSchema): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    schema ??= getZDtoSchema(target, propertyKey!, parameterIndex);
    Body(new ZValidationPipe(schema))(target, propertyKey, parameterIndex);
    ApiBody({
      schema: generateSchema(schema),
    })(
      target,
      propertyKey!,
      Reflect.getOwnPropertyDescriptor(target, propertyKey!)!,
    );
  };
}
