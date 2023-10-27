import { tsupConfig } from '@st-api/config';
import { defineConfig } from 'tsup';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const polyfillPath = join('src', 'polyfill');

const polyfills = Object.fromEntries(
  readdirSync(polyfillPath).map((file) => {
    const fileWithoutExt = file.replace(/\.ts$/, '');
    return [`polyfill/${fileWithoutExt}`, join(polyfillPath, file)];
  }),
);

export default defineConfig({
  ...tsupConfig,
  entry: {
    index: './src/index.ts',
    'vitest.setup': './vitest.setup.ts',
    ...polyfills,
  },
  dts: {
    entry: {
      index: './src/index.ts',
    },
  },
  external: ['vitest'],
});
