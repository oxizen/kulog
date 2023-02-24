import { join } from 'path';

/**
 * @param {AppModule} moduleName;
 * @return {InlineConfig}
 */
export const baseBuildConfig = moduleName => {
  return {
    mode: process.env.MODE,
    root: join(process.cwd(), 'modules', moduleName),
    envDir: process.cwd(),
    resolve: {
      alias: {
        '@main': join(process.cwd(), 'modules/main'),
        '@renderer': join(process.cwd(), 'modules/renderer'),
      },
    },
    build: {
      ssr: true,
      outDir: join(process.cwd(), 'dist'),
      minify: process.env.MODE !== 'development',
      lib: {
        entry: 'index.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        output: {
          entryFileNames: `${moduleName}.js`,
        },
      },
      emptyOutDir: false,
    },
  };
};
