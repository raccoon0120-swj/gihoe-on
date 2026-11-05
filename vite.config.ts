import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { allowedHosts: ['netsecatom.hknu.ac.kr'] },
});
