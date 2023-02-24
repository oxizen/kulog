import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useLogState } from '@/stores/logState';

const makeSelector = (o?: { [key: string]: string }) => o ? Object.keys(o).map(k => `-l ${k}=${o[k]}`).join(' ') : '';

export const useKubeState = defineStore('kubeState', () => {
  const logState = useLogState();
  const deployment = ref<string>('');
  const deploymentList = ref<({ value: string, label: string })[]>([]);
  const namespace = ref<string>('');

  const setDeployment = (v: string) => {
    deployment.value = v;
    localStorage.setItem('lastDeployment', v);
  };
  const setDeploymentList = async (v: ({ value: string, label: string })[]) => {
    deploymentList.value = v;
    const dc = localStorage.getItem('lastDeployment') ?? '';
    const defaultDeployment = v.some(lv => lv.value === dc) ? dc : '';
    setDeployment(defaultDeployment);
    if (defaultDeployment) await logState.setLogState({ namespace: namespace.value, deployment: deployment.value });
  };
  const setNamespace = async (v: string) => {
    namespace.value = v;
    localStorage.setItem('lastNamespace', v);
    if (!v) return;
    const raw = await window.app.invoke<DeploymentList>('getDeploymentList', v);
    await setDeploymentList([{ label: 'ALL', value: '' }, ...raw.items.map(d => ({
      label: d.metadata!.name!,
      value: makeSelector(d.spec!.selector.matchLabels),
    }))]);
  };

  return { namespace, setNamespace, deployment, setDeployment, deploymentList, setDeploymentList };
});