import { nextTick, onBeforeUnmount } from 'vue';
import { Terminal } from 'xterm';
type Callback = (stdout: string, exitEvent?: ObjectLiteral) => void

let sq = 0;
const callbacks: Record<number, Callback> = {};
export const useConnectPod = async (type: ConnectType, namespace: string, pod: string, terminal: Terminal, callback: Callback) => {
  sq += 1;
  const channel = sq;
  const arg = { channel, namespace, pod, type, cols: 0, rows: 0 };
  callbacks[channel] = callback;
  onBeforeUnmount(() => {
    delete callbacks[channel];
    window.app.invoke('killConnection', channel);
  });
  await nextTick();
  arg.cols = terminal.cols;
  arg.rows = terminal.rows;
  await window.app.invoke('connectTerminal', arg);
  return {
    resize: () => {
      arg.cols = terminal.cols;
      arg.rows = terminal.rows;
      window.app.invoke('resizeTerminal', arg);
    },
    reconnect: () => {
      window.app.invoke('connectTerminal', arg);
    },
    send: (data: string) => {
      window.app.invoke('sendData', channel, data);
    },
  };
};

export const init = () => {
  window.app.on('pty-out', ({ channel, log }) => {
    const callback = callbacks[channel];
    if (!callback) return;
    callback(log);
  });

  window.app.on('pty-exit', ({ channel, event }) => {
    const callback = callbacks[channel];
    if (!callback) return;
    callback('', event);
  });

  window.addEventListener('beforeunload', () => {
    Object.keys(callbacks).forEach(channel => window.app.invoke('killConnection', channel));
  });
};
