/**
 * Groups elements of an array into a Map based on the result of a callback function.
 *
 * @param array - The input array to be grouped.
 * @param callback - The callback function used to determine the group key for each element.
 * The callback function should accept three arguments: the current element,
 * the index of the current element, and the array itself. It should return
 * the key used for grouping the elements.
 */
export function arrayGroupToMap<T, R>(
  array: readonly T[],
  callback: (item: T, index: number, array: readonly T[]) => R,
): Map<R, T[]> {
  const map = new Map<R, T[]>();
  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    const key = callback(item!, index, array);
    (map.get(key) ?? map.set(key, []).get(key))!.push(item!);
  }
  return map;
}
