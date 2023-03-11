import { exec } from 'child_process';
import pty, { IPty } from 'node-pty';
import { app, ipcMain, shell } from 'electron';
import MainWindow from '@main/mainWindow';
import { join } from 'path';
import { sleep } from '@main/utils';

const ptyMap: Record<number, IPty> = {};
type ConnectParam = { type: ConnectType, namespace: string, pod: string, cols: number, rows: number, channel: number };
type ResizeParam = { channel: number, cols: number, rows: number };

const init = (window: MainWindow) => {
  ipcMain.handle('connectTerminal', (e: unknown, { namespace, pod, cols, rows, channel, type }: ConnectParam) => {
    const arg = {
      log: ['logs', `--tail=${rows*2}`, '-f', '-n', namespace, pod],
      shell: ['exec', '-it', '-n', namespace, pod, '--', '/bin/sh'],
    }[type];
    const proc = pty.spawn(process.platform === 'win32' ? 'kubectl.exe' : 'kubectl', arg, { cols, rows });
    proc.onData(log => {
      window.browserWindow.webContents.send('pty-out', { channel, log });
    });
    proc.onExit( event => {
      try {
        window.browserWindow.webContents.send('pty-exit', { channel, event });
      } catch (e) { /* empty */ }
    });
    ptyMap[channel] = proc;
  });
  ipcMain.handle('resizeTerminal', (e: unknown, { channel, cols, rows }: ResizeParam) => {
    try {
      ptyMap[channel].resize(cols, rows);
    } catch (e) { /* empty */ }
  });
  ipcMain.handle('killConnection', async (e: unknown, channel: number) => {
    const proc = ptyMap[channel];
    if (!proc) return;
    proc.write('exit');
    proc.write('\n');
    await sleep(100);
    proc.kill();
    delete ptyMap[channel];
  });
  ipcMain.handle('openWithCode', (e: unknown, namespace: string, pod: string) => new Promise<void>((resolve, reject) => {
    const file = join(app.getPath('temp'), `${pod}.txt`);
    exec(`kubectl logs -n ${namespace} ${pod} > ${file}`, (e: unknown) => {
      if (e) reject(e);
      else exec(`code ${file}`, e => {
        if (e) shell.showItemInFolder(file);
        resolve();
      });
    });
  }));
  ipcMain.handle('sendData', (e: unknown, channel: number, data: string) => ptyMap[channel].write(data));
};

export default { init };
