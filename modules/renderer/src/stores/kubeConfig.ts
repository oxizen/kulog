import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useKubeState } from '@/stores/kubeState';

export const useKubeConfig = defineStore('kubeConfig', () => {
  const { setNamespace } = useKubeState();
  const config = ref<KubeConfig | null>(null);
  const contexts = computed(() => config.value?.contexts.map(c => c.name));
  const context = computed(() => config.value?.['current-context']);
  const namespaceList = ref<string[]>([]);
  async function init() {
    config.value = await window.app.invoke<KubeConfig>('getConfig');
    const raw = await window.app.invoke<NamespaceList>('getNamespaceList');
    const nc = localStorage.getItem('lastNamespace') ?? '';
    namespaceList.value = ['', ...raw.map(x => x.NAME)];
    await setNamespace( namespaceList.value.includes(nc) ? nc : '');
  }

  return { contexts, context, namespaceList, init };
});
