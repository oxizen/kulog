import pty, { IPty } from 'node-pty';
import { ipcMain } from 'electron';
import MainWindow from '@main/mainWindow';

const ptyMap: Record<number, IPty> = {};
type ConnectParam = { namespace: string, pod: string, channel: number };

const init = (window: MainWindow) => {
  ipcMain.handle('connectLog', (e: unknown, { namespace, pod, channel }: ConnectParam) => {
    const proc = pty.spawn('kubectl', ['logs','-f','-n', namespace, pod], { name: 'c' });
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
  ipcMain.handle('killLog', (e: unknown, channel: number) => {
    const proc = ptyMap[channel];
    if (!proc) return;
    proc.kill();
    delete ptyMap[channel];
  });
};

export default { init };