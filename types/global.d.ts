type InlineConfig = import('vite').InlineConfig;
type ViteDevServer = import('vite').ViteDevServer;
type LogLevel = import('vite').LogLevel;

type OnEventKey = 'pty-out' | 'pty-exit' | 'closeWindow';
type InvokeEventKey = 'connectTerminal' | 'killConnection' | 'getConfig' | 'getNamespaceList' | 'setContext' | 'getDeploymentList' | 'getPods' | 'quitApp' | 'getPath' | 'resizeTerminal' | 'openWithCode' | 'sendData';
type AppModule = 'renderer' | 'main' | 'preload';

declare namespace Electron {
  export interface IpcMain {
    handle(channel: InvokeEventKey, listener: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<void>) | (any)): void;
  }
  export interface WebContents {
    send(channel: OnEventKey, ...args: any[]): void;
  }
}

interface AppInterface {
  on(channel: OnEventKey, listener: (...args: any[]) => void): number;
  off(id: number);
  invoke<T = void>(channel: InvokeEventKey, ...args: any[]): Promise<T>;
}

interface Window {
  app: AppInterface;
}
