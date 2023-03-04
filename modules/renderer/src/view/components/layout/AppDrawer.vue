<script setup lang="ts">
import { computed, ref } from 'vue';
import { useKubeConfig } from '@/stores/kubeConfig';
import SimpleSelect from '@/view/components/SimpleSelect.vue';
import { useKubeState } from '@/stores/kubeState';
import DeploymentItem from '@/view/components/DeploymentItem.vue';
import { useInterval } from '@/hooks/useInterval';

const kubeConfig = useKubeConfig();
const kubeState = useKubeState();
const context = computed<string>({
  get: () => kubeConfig.context ?? '',
  set: async (v: string) => {
    await window.app.invoke('setContext', v);
    await kubeConfig.init();
  }
});

const namespace = computed<string>({
  get: () => kubeState.namespace,
  set: (v: string) => kubeState.setNamespace(v)
});

const deployment = ref<DeploymentList | null>(null);
useInterval(async updated => {
  if (updated) deployment.value = null;
  if (namespace.value) deployment.value = await window.app.invoke<DeploymentList>('getDeploymentList', namespace.value);
}, 2000, namespace);
</script>
<template>
  <aside app-drawer>
    <div v-if="kubeConfig.contextList">
      <label>Context</label>
      <SimpleSelect v-model:value="context" :options="kubeConfig.contextList"/>
    </div>
    <div v-if="kubeState.namespaceList">
      <label>Namespace</label>
      <SimpleSelect v-model:value="namespace" :options="kubeState.namespaceList" placeholder="Select Namespace"/>
    </div>
    <div v-if="namespace">
      <label>Deployment</label>
      <ul v-if="deployment">
        <DeploymentItem />
        <DeploymentItem v-for="info in deployment.items" :info="info" :key="info.metadata.uid" />
      </ul>
    </div>
  </aside>
</template>

<style lang="less">
@import "~@/less/proj.less";

[app-drawer] { .w(300); .bgc(@app-drawer); .p(10); .flex; .flex-column; .gap(10); .auto-y; .rel; .z(1000);
  select { .min-w(100); .wf; }
  label { .block; .fs(16, 24); .monospace; .mb(4); }
  ul { .flex; .flex-column; .gap(4); }
  .settings { .mt(auto); .bgc(@app-header); .br(4); .p(8);
  }
}
</style>
