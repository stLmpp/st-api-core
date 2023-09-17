import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

import packageJson from './package.json';

export default defineConfig({
  test: {
    name: packageJson.name,
    environment: 'node',
    globals: true,
    root: './',
    coverage: {
      enabled: true,
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
      all: true,
      reporter: ['text', 'html', 'json', 'lcovonly'],
      cleanOnRerun: false,
      exclude: [
        'vitest.setup.ts',
        '.eslintrc.cjs',
        '**/index.ts',
        '**/*.{type,schema,token,module,config}.ts',
        '**/*.d.ts',
      ],
    },
    setupFiles: ['vitest.setup.ts'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
