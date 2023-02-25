import chalk from 'chalk';
import pkg from 'electron-builder';
const { build: electronBuild, createTargets, Platform } = pkg;
import { build as viteBuild, createLogger } from 'vite';
import { baseBuildConfig } from './config.mjs';
import commandLineArgs from 'command-line-args';

const { target } = commandLineArgs([
  { name: 'target', alias: 't', type: String },
]);

process.env.MODE = process.env.MODE || 'production';
const mode = process.env.MODE;

/** @param {AppModule} moduleNames */
const buildVitePackages = async (...moduleNames) => {
  for (const moduleName of moduleNames) {
    const config = moduleName === 'renderer' ? { configFile: 'modules/renderer/vite.config.ts' } : baseBuildConfig(moduleName);
    await viteBuild({ mode, ...config });
  }
};
const targets = {
  mac_arm64: () => electronBuild({ targets: createTargets([Platform.MAC], 'default', 'arm64') }),
  mac_x64: () => electronBuild({ targets: createTargets([Platform.MAC], 'default', 'x64') }),
  win_x64: () => electronBuild({ targets: createTargets([Platform.WINDOWS], 'nsis', 'x64'), win: ['nsis', 'zip'] })
};
const build = async () => {
  if (!(target in targets)) throw `--target option must be one of ${Object.keys(targets).join(', ')}`;
  await buildVitePackages('main', 'preload', 'renderer');
  await targets[target]();
};

build().catch(error => {
  createLogger().error(chalk.red(`error during build application:\n${error.stack || error}`));
  process.exit(1);
});
