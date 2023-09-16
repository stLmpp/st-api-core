import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  minify: true,
  clean: true,
  dts: true,
  format: 'esm',
  platform: 'node',
});
