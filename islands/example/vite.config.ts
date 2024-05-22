/// <reference types='vitest' />
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: __dirname,
  cacheDir: `${process.cwd()}node_modules/.vite/example`,
  plugins: [solidPlugin(), tsconfigPaths()],
  build: {
    lib: {
      entry: resolve(__dirname, './src/example.element.tsx'),
      name: 'example',
      fileName: 'example',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: `${process.cwd()}/coverage/test`,
      provider: 'v8',
    },
  },
});
