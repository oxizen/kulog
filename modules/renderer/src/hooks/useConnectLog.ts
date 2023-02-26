import { onBeforeUnmount } from 'vue';
type Callback = (log: string, exitEvent?: ObjectLiteral) => void

let sq = 0;
const callbacks: Record<number, Callback> = {};
export const useConnectLog = async (namespace: string, pod: string, cols: number, rows: number, callback: Callback) => {
  sq += 1;
  const channel = sq;
  const arg = { channel, namespace, pod, cols, rows };
  callbacks[channel] = callback;
  onBeforeUnmount(() => {
    delete callbacks[channel];
    window.app.invoke('killLog', channel);
  });
  await window.app.invoke('connectLog', arg);
  return {
    resize: (cols: number, rows: number) => {
      arg.cols = cols;
      arg.rows = rows;
      window.app.invoke('resizeLog', arg);
    },
    reconnect: () => {
      window.app.invoke('connectLog', arg);
    }
  };
};

export const init = () => {
  window.app.on('pty-log', ({ channel, log }) => {
    const callback = callbacks[channel];
    if (!callback) return;
    callback(log);
  });

  window.app.on('pty-log-exit', ({ channel, event }) => {
    const callback = callbacks[channel];
    if (!callback) return;
    callback('', event);
  });

  window.addEventListener('beforeunload', () => {
    Object.keys(callbacks).forEach(channel => window.app.invoke('killLog', channel));
  });
};
