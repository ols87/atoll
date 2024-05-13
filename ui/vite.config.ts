/// <reference types='vitest' />
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/ui',
  plugins: [solidPlugin()],
});
