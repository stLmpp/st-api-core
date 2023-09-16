import { rimraf } from 'rimraf';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  minify: true,
  dts: true,
  format: 'esm',
  platform: 'node',
  plugins: [
    {
      name: 'clean',
      buildStart: async () => {
        await rimraf('dist');
      },
    },
  ],
});
