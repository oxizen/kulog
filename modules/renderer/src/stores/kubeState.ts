import { ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useKubeConfig } from '@/stores/kubeConfig';

export const useKubeState = defineStore('kubeState', () => {
  const kubeConfig = useKubeConfig();
  const namespaceList = ref<string[]>([]);
  const namespace = ref<string>('');
  const setNamespace = (v: string) => {
    namespace.value = v;
    localStorage.setItem(`${kubeConfig.context}#namespace`, v);
  };
  async function init() {
    const raw = await window.app.invoke<NamespaceList>('getNamespaceList');
    const nc = localStorage.getItem(`${kubeConfig.context}#namespace`) ?? '';
    namespaceList.value = ['', ...raw.map(x => x.NAME)];
    setNamespace( namespaceList.value.includes(nc) ? nc : '');
  }
  watch(kubeConfig, init);
  return { namespaceList, namespace, setNamespace, init };
});
