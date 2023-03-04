import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useKubeConfig } from '@/stores/kubeConfig';

type LogState = { namespace: string, deployment: string, filter: string };
export const useLogState = defineStore('logState', () => {
  const kubeConfig = useKubeConfig();
  const state = ref<LogState | null>(null);
  const pending = ref<boolean>(false);
  const setLogState = (v: LogState) => {
    state.value = v;
    pending.value = true;
    localStorage.setItem(`${kubeConfig.context}#logState`, JSON.stringify(v));
  };
  const resetLogState = () => {
    state.value = null;
    localStorage.removeItem(`${kubeConfig.context}#logState`);
  };
  const init = () => {
    const lc = localStorage.getItem(`${kubeConfig.context}#logState`);
    if (lc) {
      state.value = JSON.parse(lc);
      pending.value = true;
    }
  };
  const setPending = (v: boolean) => {
    pending.value = v;
  };

  watch(kubeConfig, init);

  return { state, pending, setLogState,  resetLogState, setPending, init };
});