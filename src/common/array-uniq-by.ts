/**
 * Filters out duplicate elements from an array based on the result of a provided iteratee function.
 *
 * @param array - The array to filter.
 * @param iteratee - The iteratee function to determine the uniqueness of each element.
 * This function is called with three arguments: value, index, and array.
 */
export function arrayUniqBy<T>(
  array: readonly T[],
  iteratee: (value: T, index: number, array: readonly T[]) => unknown,
): T[] {
  const seen = new Set<unknown>();
  return array.filter((item, index, originalArray) => {
    const key = iteratee(item, index, originalArray);
    if (!seen.has(key)) {
      seen.add(key);
      return true;
    }
    return false;
  });
}
