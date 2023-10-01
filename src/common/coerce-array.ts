import { isArray } from './is-array.js';

/**
 * Coerce a value into an array.
 *
 * @param possibleArray - The value to coerce into an array.
 */
export function coerceArray<T>(possibleArray: T | T[] | readonly T[]): T[] {
  return isArray(possibleArray) ? [...possibleArray] : [possibleArray];
}
