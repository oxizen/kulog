<script setup lang="ts">
import { computed } from 'vue';
import { useKubeConfig } from '@/stores/kubeConfig';
import SimpleSelect from '@/view/components/SimpleSelect.vue';
import { useKubeState } from '@/stores/kubeState';
import { useLogState } from '@/stores/logState';
import { useAlignState } from '@/stores/alignState';

const kubeConfig = useKubeConfig();
const kubeState = useKubeState();
const logState = useLogState();
const alignState = useAlignState();
kubeConfig.init();

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

const deployment = computed<string>({
  get: () => kubeState.deployment,
  set: (v: string) => kubeState.setDeployment(v)
});

const close = () => window.app.invoke('quitApp');

</script>
<template>
  <header app-header>
    <h1>KULOG</h1>
    <label v-if="kubeConfig.contexts">
      <span>Context</span>
      <SimpleSelect v-model:value="context" :options="kubeConfig.contexts"/>
    </label>
    <label v-if="kubeConfig.namespaceList">
      <span>Namespace</span>
      <SimpleSelect v-model:value="namespace" :options="kubeConfig.namespaceList" placeholder="Select Namespace"/>
    </label>
    <template v-if="namespace">
      <label v-if="kubeState.deploymentList">
        <span>Deployment</span>
        <SimpleSelect v-model:value="deployment" :options="kubeState.deploymentList" placeholder="ALL"/>
      </label>
      <button class="refresh" @click="logState.setLogState({ namespace, deployment })" :class="{ locked: logState.locked }">
        <img src="@/assets/refresh.svg" alt="refresh">
      </button>
    </template>
    <div class="handle"></div>
    <ul class="align">
      <li v-for="v in 'FVH'" :key="v" :class="{ active: v === alignState.align }" @click="alignState.setAlign(v)">
        <img v-if="v === 'F'" src="@/assets/free.png" alt="free">
        <img v-else src="@/assets/align.png" alt="align" :class="v">
      </li>
    </ul>
    <button class="close" @click="close"><img src="@/assets/close.svg" alt="close"></button>
  </header>
</template>

<style lang="less">
@import "~@/less/proj.less";

[app-header] { .bgc(@app-header); .flex; .items-center; .sticky; .rel; .h(40); .z(1000);
  h1 { .app-drag; .p(0,10); .bold; .fs(24,24); .monospace; }
  select { .h(20); .min-w(100); .br(4); }
  label { .rel; .flex; .items-center; .gap(8); .p(10);
    span { .fs(16,24); .monospace; .app-drag; }
  }
  .refresh {
    &.locked { .events-none;
      img { animation: rotation 0.7s infinite linear; }
    }
  }
  .handle { .h(40); .flex-grow; .app-drag; }
  .align { .flex; .monospace; .bgc(#444); .fs(18); .br(4); .crop;
    li { .p(2,8); .pointer;
      &.active { .bgc(#666); }
      img { .wh(24); .block;
        &.V { .t-r(90deg); }
      }
    }
    li + li { .-l(#555); }
  }
  .close { .p(0,5); }
}
</style>
