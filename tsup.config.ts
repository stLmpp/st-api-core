import { tsupConfig } from '@assis-delivery/config';
import { defineConfig } from 'tsup';

export default defineConfig({
  ...tsupConfig,
  entry: {
    index: './src/index.ts',
    'vitest.setup': './vitest.setup.ts',
  },
  dts: {
    entry: {
      index: './src/index.ts',
    },
  },
  external: ['vitest'],
});
