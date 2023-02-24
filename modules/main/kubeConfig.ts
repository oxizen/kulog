import { ipcMain } from 'electron';
import { exec } from 'child_process';
import yaml from 'js-yaml';
import fs from 'fs';
import { join } from 'path';
import os from 'os';
import { Parser } from 'tsv';
// @ts-ignore
const tsvParser = new Parser(/\s+/);
const getConfig = () => yaml.load(fs.readFileSync(join(os.homedir(), '/.kube/config'), 'utf8'));

const execOut = (command: string) => new Promise<string>((resolve, reject) => {
  exec(command,(error, out) => {
    if (error) reject(error);
    else resolve(out.trim());
  });
});

const setContext = (e: unknown, context: string) => execOut(`kubectl config use-context ${context}`);
const getNamespaceList = async () => tsvParser.parse(await execOut('kubectl get namespace'));
const getDeploymentList = async (e: unknown, namespace: string) => JSON.parse(await execOut(`kubectl get deployment -n ${namespace} -o json`));
const getPods = async (e: unknown, namespace: string, deployment: string) => tsvParser.parse(await execOut(`kubectl get pods -n ${namespace} ${deployment}`));

const init = () => {
  ipcMain.handle('getConfig', getConfig);
  ipcMain.handle('setContext', setContext);
  ipcMain.handle('getNamespaceList', getNamespaceList);
  ipcMain.handle('getDeploymentList', getDeploymentList);
  ipcMain.handle('getPods', getPods);
};

export default { init };