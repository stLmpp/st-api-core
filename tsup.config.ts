import { tsupConfig } from '@st-api/config';
import { defineConfig } from 'tsup';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import timers from 'node:timers/promises';

const polyfillPath = path.join('src', 'polyfill');

const polyfills = Object.fromEntries(
  fs.readdirSync(polyfillPath).map((file) => {
    const fileWithoutExt = file.replace(/\.ts$/, '');
    return [`polyfill/${fileWithoutExt}`, path.join(polyfillPath, file)];
  }),
);

async function fixDtsFile(filePath: string): Promise<void> {
  const file = await fsp.readFile(filePath, 'utf-8');
  await fsp.writeFile(filePath, file.replaceAll(`';`, `.js';`));
}

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
  plugins: [
    ...(tsupConfig.plugins ?? []),
    {
      name: 'dts-fix',
      buildEnd: () => {
        (async () => {
          while (!fs.existsSync('dist/index.d.ts')) {
            await timers.setTimeout(500);
          }
          await fsp.cp('.tsup/declaration/src', 'dist/src', {
            recursive: true,
          });
          await Promise.all([
            fixDtsFile('dist/index.d.ts'),
            fixDtsFile('dist/_tsup-dts-rollup.d.ts'),
          ]);
        })();
      },
    },
  ],
});
