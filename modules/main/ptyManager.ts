import pty, { IPty } from 'node-pty';
import { ipcMain } from 'electron';
import MainWindow from '@main/mainWindow';

const ptyMap: Record<number, IPty> = {};
type ConnectParam = { namespace: string, pod: string, cols: number, rows: number, channel: number };
type ResizeParam = { channel: number, cols: number, rows: number };

const init = (window: MainWindow) => {
  ipcMain.handle('connectLog', (e: unknown, { namespace, pod, cols, rows, channel }: ConnectParam) => {
    const proc = pty.spawn(process.platform === 'win32' ? 'kubectl.exe' : 'kubectl', ['logs','-f','-n', namespace, pod], { cols, rows });
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
    ptyMap[channel].resize(cols, rows);
  });
  ipcMain.handle('killLog', (e: unknown, channel: number) => {
    const proc = ptyMap[channel];
    if (!proc) return;
    proc.kill();
    delete ptyMap[channel];
  });
};

export default { init };
