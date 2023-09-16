import { coerceArray } from './coerce-array.js';

describe('coerce-array', () => {
  it('should coerce non-array', () => {
    expect(coerceArray(1)).toEqual([1]);
  });
});
