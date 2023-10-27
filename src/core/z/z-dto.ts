import { z, ZodSchema } from 'zod';

export const Z_DTO_SCHEMA = Symbol('Zod Dto Schema');

export interface ZDto<T extends ZodSchema = ZodSchema> {
  new (): z.infer<T>;
}

export interface ZDtoInternal<T extends ZodSchema = ZodSchema> extends ZDto<T> {
  readonly [Z_DTO_SCHEMA]: T;
}

/**
 * Creates a new Dto class based on the given Zod schema.
 *
 * @param schema - The Zod schema to use for the Dto class.
 */
export function zDto<T extends ZodSchema>(schema: T): ZDto<T> {
  class Dto {
    static readonly [Z_DTO_SCHEMA] = schema;
  }
  return Dto;
}

export function isZDto(value: unknown): value is ZDtoInternal {
  return (
    !!value &&
    typeof value === 'function' &&
    Z_DTO_SCHEMA in value &&
    value[Z_DTO_SCHEMA] instanceof ZodSchema
  );
}

export function getZDto(
  target: NonNullable<unknown>,
  propertyKey: string | symbol,
  parameterIndex: number,
): ZDtoInternal {
  const type = Reflect.getMetadata('design:paramtypes', target, propertyKey)?.[
    parameterIndex
  ];
  if (!isZDto(type)) {
    throw new Error(`${type?.name} is not a ZodDto`);
  }
  return type;
}
