import {defineConfig} from 'vite';

export default defineConfig({
  define: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    target: 'es2021',
    commonjsOptions: {transformMixedEsModules: true},
    lib: {
      entry: 'web/src/app.js',
      name: 'test',
      fileName: 'client',
    },
    outDir: 'dist/client',
    rollupOptions: {},
    minify: 'esbuild',
  }
});