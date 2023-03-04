import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useKubeConfig = defineStore('kubeConfig', () => {
  const config = ref<KubeConfig | null>(null);
  const contextList = computed(() => config.value?.contexts.map(c => c.name));
  const context = computed(() => config.value?.['current-context']);

  const init = async () => {
    config.value = await window.app.invoke<KubeConfig>('getConfig');
  };

  return { contextList, context, init };
});
