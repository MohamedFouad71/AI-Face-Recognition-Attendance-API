import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '#config': new URL('./src/config', import.meta.url).pathname,
      '#controllers': new URL('./src/controllers', import.meta.url).pathname,
      '#middlewares': new URL('./src/middlewares', import.meta.url).pathname,
      '#models': new URL('./src/models', import.meta.url).pathname,
      '#routes': new URL('./src/routes', import.meta.url).pathname,
      '#services': new URL('./src/services', import.meta.url).pathname,
      '#types': new URL('./src/types', import.meta.url).pathname,
      '#utils': new URL('./src/utils', import.meta.url).pathname,
    },
  },
  test: {
    globals: false,
    restoreMocks: true,
    silent: true,
  },
});
