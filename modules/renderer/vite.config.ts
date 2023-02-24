import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { join } from 'path';
import * as process from 'process';

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.MODE,
  root: __dirname,
  base: '',
  publicDir: 'public',
  envDir: process.cwd(),
  resolve: {
    alias: {
      '@': join(__dirname, './src'),
      '~@': join(__dirname, './src'),
      '@type': join(process.cwd(), '/types')
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  build: {
    outDir: join(process.cwd(), 'dist'),
  },
  plugins: [vue()],
});
