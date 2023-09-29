import { Body as NestBody } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

import { generateSchema } from '../../common/generate-schema.js';

import { getZodDto, ZOD_DTO_SCHEMA } from './zod-dto.js';

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
 *   @Body()
 *   createUser(@Body() createUserDto: CreateUserDto) {
 *     // implementation here
 *   }
 * }
 * ```
 *
 * @see [NestBody](https://docs.nestjs.com/controllers#body)
 * @see [ApiBody](https://docs.nestjs/swagger/modules#api-body)
 */
export function Body(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const type = getZodDto(target, propertyKey!, parameterIndex);
    NestBody()(target, propertyKey, parameterIndex);
    ApiBody({
      schema: generateSchema(type[ZOD_DTO_SCHEMA]),
    })(
      target,
      propertyKey!,
      Reflect.getOwnPropertyDescriptor(target, propertyKey!)!,
    );
  };
}
