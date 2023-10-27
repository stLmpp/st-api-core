import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { type Paramtype } from '@nestjs/common/interfaces/features/paramtype.interface.js';

import { formatZodErrorString } from '../../common/zod-error-formatter.js';
import {
  BAD_REQUEST_BODY,
  BAD_REQUEST_PARAMS,
  BAD_REQUEST_QUERY,
} from '../exception/core-exceptions.js';
import type { ExceptionFactoryWithError } from '../exception/exception.type.js';

import { isZDto, Z_DTO_SCHEMA } from './z-dto.js';

/**
 * ZValidationPipe is a class that implements the PipeTransform interface and is used to validate
 * incoming data using a Zod schema.
 *
 * @remarks
 * This class is used in NestJS applications to validate data sent through parameters, body, or query.
 * It checks if the type of the parameter is supported and if the metadata type is a ZDto class.
 * If both conditions are true, it validates the value against the Zod schema and throws an exception
 * if the validation fails.
 *
 * @example
 * // Create a ZDto class with a schema
 * class CreateProductDto extends zDto(z.object({
 *   name: z.string().max(30),
 *   price: z.number()
 * })) {}
 *
 * // Use the ZValidationPipe in a controller
 * @Post('products')
 * createProduct(@Body(new ZValidationPipe()) createProductDto: CreateProductDto) {
 *   // handle the createProductDto object
 * }
 */
@Injectable()
export class ZValidationPipe implements PipeTransform {
  private readonly PARAM_TYPES: ReadonlySet<Paramtype> = new Set<Paramtype>([
    'param',
    'body',
    'query',
  ]);

  private readonly NEST_Z_PIPE_EXCEPTIONS: Record<
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
    if (!this.isParamTypeSupported(type) || !isZDto(metatype)) {
      return value;
    }
    const schema = metatype[Z_DTO_SCHEMA];
    const parsed = await schema.safeParseAsync(value);
    if (!parsed.success) {
      const exceptionFactory = this.NEST_Z_PIPE_EXCEPTIONS[type];
      throw exceptionFactory(formatZodErrorString(parsed.error));
    }
    return parsed.data;
  }
}
