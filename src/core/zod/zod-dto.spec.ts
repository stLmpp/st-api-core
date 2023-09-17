import { z, ZodObject } from 'zod';

import {
  getZodDto,
  isZodDto,
  ZOD_DTO_SCHEMA,
  zodDto,
  ZodDtoInternal,
} from './zod-dto.js';

describe('zod-dto', () => {
  it('should create a ZodDto', () => {
    class Dto extends zodDto(z.object({ id: z.number() })) {}

    expect(ZOD_DTO_SCHEMA in Dto).toBe(true);
    expect(
      ZOD_DTO_SCHEMA in Dto && (Dto as ZodDtoInternal)[ZOD_DTO_SCHEMA],
    ).toBeInstanceOf(ZodObject);
  });

  it.each([
    { value: class ValidDto extends zodDto(z.object({})) {}, expected: true },
    { value: {}, expected: false },
    { value: [], expected: false },
    { value: undefined, expected: false },
    { value: { [ZOD_DTO_SCHEMA]: z.object({}) }, expected: false },
    { value: class InvalidDto {}, expected: false },
    {
      value: class ValidManualDto {
        static readonly [ZOD_DTO_SCHEMA] = z.object({});
      },
      expected: true,
    },
    {
      value: class NotValidManualDto {
        static readonly [ZOD_DTO_SCHEMA] = {};
      },
      expected: false,
    },
  ])('should check if value is ZodDto ($value)', ({ value, expected }) => {
    expect(isZodDto(value)).toBe(expected);
  });

  describe('getZodDto', () => {
    it.each([
      {},
      [],
      undefined,
      { [ZOD_DTO_SCHEMA]: z.object({}) },
      class NotValidManualDto {
        static readonly [ZOD_DTO_SCHEMA] = {};
      },
      class InvalidDto {},
    ])('should throw error if not ZodDto (%s)', (value) => {
      const target = {};
      const propertyKey = 'key';
      Reflect.defineMetadata('design:paramtypes', [value], target, propertyKey);
      expect(() => getZodDto(target, propertyKey, 0)).toThrowError(
        new Error(`${(value as any)?.name} is not a ZodDto`),
      );
    });
  });

  it.each([
    class ValidDto extends zodDto(z.object({})) {},
    class ValidManualDto {
      static readonly [ZOD_DTO_SCHEMA] = z.object({});
    },
  ])('should get ZodDto (%s)', (value) => {
    const target = {};
    const propertyKey = 'key';
    Reflect.defineMetadata('design:paramtypes', [value], target, propertyKey);
    const type = getZodDto(target, propertyKey, 0);
    expect(type).toBe(value);
  });
});
