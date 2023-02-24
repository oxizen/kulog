import { onBeforeUnmount } from 'vue';

let sq = 0;
const callbacks: Record<number, (log: string, exitEvent?: ObjectLiteral) => void> = {};
export const useConnectLog = async (namespace: string, pod: string, callback: (log: string, exitEvent?: ObjectLiteral) => void) => {
  sq += 1;
  const channel = sq;
  callbacks[channel] = callback;
  onBeforeUnmount(() => {
    delete callbacks[channel];
    window.app.invoke('killLog', channel);
  });
  await window.app.invoke('connectLog', { namespace, pod, channel });
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