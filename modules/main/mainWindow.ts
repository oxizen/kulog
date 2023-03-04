import type { BrowserWindowConstructorOptions } from 'electron';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { setting } from './setting';
import { join } from 'path';

export default class MainWindow {
  private window = null as unknown as BrowserWindow;
  private bounds = setting.get('bounds');

  private init = () => {
    const bound: BrowserWindowConstructorOptions = this.bounds.main || { x: 0, y: 0 };
    this.window = new BrowserWindow({
      ...bound,
      show: false,
      frame: false,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webviewTag: false,
        preload: join(__dirname, '../dist/preload.js'),
      },
    });
    this.window.setMenuBarVisibility(false);
    this.addMovedEvent();
    this.addClosedEvent();
    this.addFacade();
    this.addWindowOpenHandler();

    const pageUrl = import.meta.env.DEV ? import.meta.env.VITE_DEV_SERVER_URL : new URL('dist/index.html', `file://${__dirname}`).toString();

    this.window.once('ready-to-show', () => setTimeout(() => this.window.show(), 100));
    return this.window.loadURL(pageUrl).then(() => this.window);
  };

  get = () => this.window;

  create = async (): Promise<BrowserWindow> => {
    let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

    if (!window) window = await this.init();
    if (window.isMinimized()) window.restore();
    window.focus();

    return window;
  };

  private addMovedEvent() {
    const saveBounds = () => {
      this.bounds.main = this.window.getBounds();
      setting.set('bounds', this.bounds);
    };
    this.window.addListener('moved', saveBounds);
    this.window.addListener('resized', saveBounds);
  }

  private addClosedEvent() {
    this.window.on('closed', app.quit);
  }

  private addWindowOpenHandler() {
    this.window.webContents.setWindowOpenHandler(({ url }) => {
      if (/^https?:/.test(url)) shell.openExternal(url).then(() => true);
      return { action: 'deny' };
    });
  }

  private addFacade() {
    ipcMain.handle('quitApp', app.quit);
  }

  get browserWindow() {
    return this.window;
  }
}
