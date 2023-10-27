import { formatZodIssuePath } from './zod-error-formatter.js';

describe('zod-error-formatter', () => {
  describe('formatZodIssuePath', () => {
    it.each([
      {
        name: 'nested-object',
        value: ['object', 'nested'],
        result: 'object.nested',
      },
      {
        name: 'nested-array',
        value: ['object', 'array', 0, 'property'],
        result: 'object.array[0].property',
      },
      {
        name: 'simple-object',
        value: ['property'],
        result: 'property',
      },
      {
        name: 'simple-array',
        value: [0],
        result: '[0]',
      },
      {
        name: 'matrix',
        value: [0, 0],
        result: '[0][0]',
      },
    ])('should format path correctly ($name)', ({ value, result }) => {
      expect(formatZodIssuePath(value)).toBe(result);
    });
  });
});
