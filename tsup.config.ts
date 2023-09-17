import { rimraf } from 'rimraf';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  minify: true,
  dts: true,
  format: 'esm',
  platform: 'node',
  tsconfig: 'tsconfig.build.json',
  plugins: [
    {
      name: 'clean',
      buildStart: async () => {
        await rimraf('dist');
      },
    },
  ],
});
