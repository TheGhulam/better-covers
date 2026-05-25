// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        'better-covers/renderers': path.resolve(__dirname, '../src/renderers'),
        'better-covers/shared': path.resolve(__dirname, '../src/shared'),
        'better-covers': path.resolve(__dirname, '../src'),
      },
    },
  },
});
