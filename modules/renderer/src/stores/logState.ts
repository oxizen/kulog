import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLogState = defineStore('logState', () => {
  const logList = ref<{ namespace: string, pod: string }[]>([]);
  const locked = ref<boolean>(false);
  const setLogState = async (v: { namespace: string, deployment: string }) => {
    locked.value = true;
    const podList = await window.app.invoke<PodList>('getPods', v.namespace, v.deployment);
    logList.value = podList.map(i => ({ pod: i.NAME, namespace: v.namespace }));
    locked.value = false;
  };

  return { logList, locked, setLogState };
});