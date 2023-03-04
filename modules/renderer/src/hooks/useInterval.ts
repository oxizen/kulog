import { onBeforeUnmount, watch, WatchSource } from 'vue';
import { sleep } from '@main/utils';

const timeoutOrUpdated = (timeout: number, dependency?: WatchSource) => dependency ? new Promise<boolean>(resolve => {
  let expired = false;
  const timeoutId = setTimeout(() => {
    if (expired) return;
    expired = true;
    unwatch();
    resolve(false);
  }, timeout);
  const unwatch = watch(dependency, () => {
    if (expired) return;
    expired = true;
    clearTimeout(timeoutId);
    resolve(true);
  });
}) : sleep(timeout);
export const useInterval = async (handler: (updated: boolean | void) => Promise<void>, timeout: number, dependency?: WatchSource) => {
  let flag = true;
  let updated: boolean | void = undefined;
  onBeforeUnmount(() => flag = false);
  while (flag) {
    await handler(updated);
    updated = await timeoutOrUpdated(timeout, dependency);
  }
};