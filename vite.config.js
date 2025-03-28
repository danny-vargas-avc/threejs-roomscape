import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [vue()],
  server: {
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'index.html'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').at(1);
          if (extType !== 'css') {
            return `static/app/assets/[name]-[hash][extname]`;
          }
          return `static/app/css/[name]-[hash][extname]`;
        },
        chunkFileNames: 'static/app/js/[name]-[hash].js',
        entryFileNames: 'static/app/js/[name]-[hash].js',
      },
    },
  },
});
