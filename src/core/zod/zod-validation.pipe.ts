import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Paramtype } from '@nestjs/common/interfaces/features/paramtype.interface.js';

import { formatZodErrorString } from '../../common/zod-error-formatter.js';
import {
  BAD_REQUEST_BODY,
  BAD_REQUEST_PARAMS,
  BAD_REQUEST_QUERY,
} from '../exception/core-exceptions.js';
import { ExceptionFactoryWithError } from '../exception/exception.type.js';

import { isZodDto, ZOD_DTO_SCHEMA } from './zod-dto.js';

/**
 * ZodValidationPipe is a class that implements the PipeTransform interface and is used to validate
 * incoming data using a Zod schema.
 *
 * @remarks
 * This class is used in NestJS applications to validate data sent through parameters, body, or query.
 * It checks if the type of the parameter is supported and if the metadata type is a ZodDto class.
 * If both conditions are true, it validates the value against the Zod schema and throws an exception
 * if the validation fails.
 *
 * @example
 * // Create a ZodDto class with a schema
 * class CreateProductDto extends zodDto(z.object({
 *   name: z.string().max(30),
 *   price: z.number()
 * })) {}
 *
 * // Use the ZodValidationPipe in a controller
 * @Post('products')
 * createProduct(@Body(new ZodValidationPipe()) createProductDto: CreateProductDto) {
 *   // handle the createProductDto object
 * }
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly PARAM_TYPES: ReadonlySet<Paramtype> = new Set<Paramtype>([
    'param',
    'body',
    'query',
  ]);

  private readonly NEST_ZOD_PIPE_EXCEPTIONS: Record<
    Exclude<Paramtype, 'custom'>,
    ExceptionFactoryWithError
  > = {
    body: BAD_REQUEST_BODY,
    param: BAD_REQUEST_PARAMS,
    query: BAD_REQUEST_QUERY,
  };

  private isParamTypeSupported(
    type: Paramtype,
  ): type is Exclude<Paramtype, 'custom'> {
    return this.PARAM_TYPES.has(type);
  }

  async transform(
    value: unknown,
    { type, metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!this.isParamTypeSupported(type) || !isZodDto(metatype)) {
      return value;
    }
    const schema = metatype[ZOD_DTO_SCHEMA];
    const parsed = await schema.safeParseAsync(value);
    if (!parsed.success) {
      const exceptionFactory = this.NEST_ZOD_PIPE_EXCEPTIONS[type];
      throw exceptionFactory(formatZodErrorString(parsed.error));
    }
    return parsed.data;
  }
}
