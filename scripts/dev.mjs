import { build, createServer, mergeConfig } from 'vite';
import electron from 'electron';
import spawn from 'cross-spawn';
import chalk from 'chalk';
import { baseBuildConfig } from './config.mjs';

process.env.MODE = process.env.MODE || 'development';
const mode = process.env.MODE;

/** @type {LogLevel} */
const logLevel = 'warn';

/**
 * @param {AppModule} moduleName
 * @param {InlineConfig} inlineConfig
 * @return {InlineConfig}
 */
const config = (moduleName, inlineConfig) =>
  /** @type {InlineConfig} */ mergeConfig(baseBuildConfig(moduleName), inlineConfig);

/** @param {ViteDevServer} server */
const setupMainWatcher = ({ resolvedUrls }) => {
  [process.env.VITE_DEV_SERVER_URL] = resolvedUrls.local;

  let electronApp = null;

  return build(config('main', {
    mode,
    logLevel,
    build: {
      watch: {},
    },
    plugins: [{
      name: 'reload-app-on-main-change',
      writeBundle() {
        if (electronApp) {
          electronApp.removeListener('exit', process.exit);
          electronApp.kill('SIGINT');
          electronApp = null;
        }

        electronApp = spawn('electron', ['.'], { stdio: 'inherit' });
        electronApp.addListener('exit', process.exit);
      },
    }],
  }));
};

/**
 * @param {AppModule} moduleName
 * @param {ViteDevServer} server
 */
const setupWatcher = (moduleName, { ws }) => build(config(moduleName, {
  build: {
    watch: {},
  },
  plugins: [{
    name: `reload-page-on-${moduleName}-change`,
    writeBundle() {
      ws.send({
        type: 'full-reload',
      });
    },
  }],
}));

const rendererServer = await createServer({
  mode,
  logLevel,
  configFile: 'modules/renderer/vite.config.ts',
}).then(async s => {
  const server = await s.listen();
  const [url] = server.resolvedUrls.local;
  console.log(chalk.green(`🚀 dev-server running at: ${chalk.underline(url)}`));

  return server;
});

await setupWatcher('preload', rendererServer);
await setupMainWatcher(rendererServer);
