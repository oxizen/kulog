import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

type Listener = (event: IpcRendererEvent, ...args: any[]) => void;
type PairMap = {
  [key: number]: {
    channel: string;
    listener: Listener
  }
};

const pairMap = {} as PairMap;
let seq = 0;
contextBridge.exposeInMainWorld('app', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => {
    seq += 1;
    const listener: Listener = (e, ...args) => callback(...args);
    pairMap[seq] = { channel, listener };
    ipcRenderer.on(channel, listener);
    return seq;
  },
  off: id => {
    const pair = pairMap[id];
    ipcRenderer.removeListener(pair.channel, pair.listener);
    delete pairMap[id];
  },
} as AppInterface);
