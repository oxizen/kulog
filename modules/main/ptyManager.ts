import { exec } from 'child_process';
import pty, { IPty } from 'node-pty';
import { app, ipcMain, shell } from 'electron';
import MainWindow from '@main/mainWindow';
import { join } from 'path';

const ptyMap: Record<number, IPty> = {};
type ConnectParam = { namespace: string, pod: string, cols: number, rows: number, channel: number };
type ResizeParam = { channel: number, cols: number, rows: number };

const init = (window: MainWindow) => {
  ipcMain.handle('connectLog', (e: unknown, { namespace, pod, cols, rows, channel }: ConnectParam) => {
    const proc = pty.spawn(process.platform === 'win32' ? 'kubectl.exe' : 'kubectl', ['logs', `--tail=${rows*2}`,'-f','-n', namespace, pod], { cols, rows });
    proc.onData(log => {
      window.browserWindow.webContents.send('pty-log', { channel, log });
    });
    proc.onExit( event => {
      try {
        window.browserWindow.webContents.send('pty-log-exit', { channel, event });
      } catch (e) { /* empty */ }
    });
    ptyMap[channel] = proc;
  });
  ipcMain.handle('resizeLog', (e: unknown, { channel, cols, rows }: ResizeParam) => {
    try {
      ptyMap[channel].resize(cols, rows);
    } catch (e) { /* empty */ }
  });
  ipcMain.handle('killLog', (e: unknown, channel: number) => {
    const proc = ptyMap[channel];
    if (!proc) return;
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
};

export default { init };
