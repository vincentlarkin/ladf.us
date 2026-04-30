import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        map: resolve(__dirname, 'map.html'),
        parish: resolve(__dirname, 'parish.html'),
        represent: resolve(__dirname, 'represent.html'),
        services: resolve(__dirname, 'services.html'),
      },
    },
  },
});
