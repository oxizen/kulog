import { app } from 'electron';
import MainWindow from './mainWindow';
import { install } from './devTools';
import pty from './ptyManager';
import kube from './kubeConfig';
import fixPath from './fixPath';

class Main {
  private app = app;
  private mainWindow = new MainWindow();

  constructor() {
    this.appSettings();
    this.prepareCli().then(() => this.ready()).catch(e => console.error('Failed create window:', e));
  }

  static init() {
    return new Main();
  }

  private singleInstance = () => {
    const isSingleInstance = this.app.requestSingleInstanceLock();
    if (!isSingleInstance) {
      this.app.quit();
      process.exit(0);
    }
    this.app.on('second-instance', this.mainWindow.create);
  };

  private appSettings = () => {
    /** 여러 인스턴스를 실행하는 것 방지 */
    this.singleInstance();
    /** 하드웨어 가속 사용안함 */
    this.app.disableHardwareAcceleration();
    /** 모든창을 닫으면 앱 종료 */
    this.app.on('window-all-closed', () => process.platform !== 'darwin' && this.app.quit());
    /** 애플리케이션이 활성화 되면 main window 생성 (macOS) */
    this.app.on('activate', () => this.mainWindow.get()?.show());
  };
  private prepareCli = async () => {
    await fixPath.fix();
    pty.init(this.mainWindow);
    kube.init();
  };

  /** 일렉트론 앱이 준비되면 main window 생성 및 devtools 설치 */
  private ready = async () => {
    await this.app.whenReady();
    await this.mainWindow.create();
    if (import.meta.env.VITE_DEBUG) {
      await install(this.mainWindow.browserWindow);
    }
  };
}

Main.init();

