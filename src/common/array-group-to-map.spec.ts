import { arrayGroupToMap } from './array-group-to-map.js';

describe('array-group-to-map', () => {
  it('should group to map (simple array)', () => {
    const array = Array.from({ length: 6 }, (_, index) => index + 1);
    const mapped = arrayGroupToMap(array, (item) => item % 2);
    expect(mapped).toEqual(
      new Map<number, number[]>().set(1, [1, 3, 5]).set(0, [2, 4, 6]),
    );
  });

  it('should group to map (object array)', () => {
    const array = [
      { id: 1, name: 'N1' },
      { id: 2, name: 'N1' },
      { id: 3, name: 'N1' },
      { id: 4, name: 'N2' },
      { id: 5, name: 'N2' },
      { id: 6, name: 'N3' },
    ];
    const mapped = arrayGroupToMap(array, (item) => item.name);
    expect(mapped).toEqual(
      new Map<string, typeof array>()
        .set('N1', [
          { id: 1, name: 'N1' },
          { id: 2, name: 'N1' },
          { id: 3, name: 'N1' },
        ])
        .set('N2', [
          { id: 4, name: 'N2' },
          { id: 5, name: 'N2' },
        ])
        .set('N3', [{ id: 6, name: 'N3' }]),
    );
  });
});
