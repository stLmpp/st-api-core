import { tsupConfig } from '@st-api/config';
import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

const polyfillPath = path.join('src', 'polyfill');

const polyfills = Object.fromEntries(
  fs.readdirSync(polyfillPath).map((file) => {
    const fileWithoutExt = file.replace(/\.ts$/, '');
    return [`polyfill/${fileWithoutExt}`, path.join(polyfillPath, file)];
  }),
);

export default defineConfig({
  ...tsupConfig,
  dts: false,
  entry: {
    index: './src/index.ts',
    'vitest.setup': './vitest.setup.ts',
    ...polyfills,
  },
  experimentalDts: {
    entry: {
      index: './src/index.ts',
    },
  },
  external: ['vitest'],
});
