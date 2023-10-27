import { z, ZodObject } from 'zod';

import { getZDto, isZDto, Z_DTO_SCHEMA, zDto, ZDtoInternal } from './z-dto.js';

describe('z-dto', () => {
  it('should create a ZDto', () => {
    class Dto extends zDto(z.object({ id: z.number() })) {}

    expect(Z_DTO_SCHEMA in Dto).toBe(true);
    expect(
      Z_DTO_SCHEMA in Dto && (Dto as ZDtoInternal)[Z_DTO_SCHEMA],
    ).toBeInstanceOf(ZodObject);
  });

  it.each([
    { value: class ValidDto extends zDto(z.object({})) {}, expected: true },
    { value: {}, expected: false },
    { value: [], expected: false },
    { value: undefined, expected: false },
    { value: { [Z_DTO_SCHEMA]: z.object({}) }, expected: false },
    { value: class InvalidDto {}, expected: false },
    {
      value: class ValidManualDto {
        static readonly [Z_DTO_SCHEMA] = z.object({});
      },
      expected: true,
    },
    {
      value: class NotValidManualDto {
        static readonly [Z_DTO_SCHEMA] = {};
      },
      expected: false,
    },
  ])('should check if value is ZDto ($value)', ({ value, expected }) => {
    expect(isZDto(value)).toBe(expected);
  });

  describe('getZDto', () => {
    it.each([
      {},
      [],
      undefined,
      { [Z_DTO_SCHEMA]: z.object({}) },
      class NotValidManualDto {
        static readonly [Z_DTO_SCHEMA] = {};
      },
      class InvalidDto {},
    ])('should throw error if not ZDto (%s)', (value) => {
      const target = {};
      const propertyKey = 'key';
      Reflect.defineMetadata('design:paramtypes', [value], target, propertyKey);
      expect(() => getZDto(target, propertyKey, 0)).toThrowError(
        new Error(`${(value as any)?.name} is not a ZodDto`),
      );
    });
  });

  it.each([
    class ValidDto extends zDto(z.object({})) {},
    class ValidManualDto {
      static readonly [Z_DTO_SCHEMA] = z.object({});
    },
  ])('should get ZDto (%s)', (value) => {
    const target = {};
    const propertyKey = 'key';
    Reflect.defineMetadata('design:paramtypes', [value], target, propertyKey);
    const type = getZDto(target, propertyKey, 0);
    expect(type).toBe(value);
  });
});
