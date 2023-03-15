<script setup lang="ts">
import { computed, PropType } from 'vue';
import { useLogState } from '@/stores/logState';
import { useKubeState } from '@/stores/kubeState';

const makeFilter = (o?: { [key: string]: string }) => o ? Object.keys(o).map(k => `-l ${k}=${o[k]}`).join(' ') : '';
const logState = useLogState();
const kubeState = useKubeState();
const props = defineProps({
  info: { type: Object as PropType<Deployment> },
});
const deployment = computed<string>(() => props.info?.metadata.name ?? '');
const active = computed<boolean>(() => !!logState.state
    && logState.state.namespace === kubeState.namespace
    && logState.state.deployment === deployment.value
);
const activeLog = () => {
  const filter = makeFilter(props.info?.spec.selector.matchLabels);
  logState.setLogState({ namespace: kubeState.namespace, deployment: deployment.value, filter });
};

const available = computed<boolean>(() => {
  return props.info?.status.conditions.find(c => c.type === 'Available')?.reason === 'MinimumReplicasAvailable';
});

const progress = computed<boolean>(() => {
  return props.info?.status.conditions.find(c => c.type === 'Progressing')?.reason !== 'NewReplicaSetAvailable';
});

</script>
<template>
  <li deployment-item :class="{ active, available, unavailable: !available, progress, all: !info }" @click="activeLog">
    <div v-if="info">
      <div :title="info.spec.template.spec.containers.map(c => c.image?.split('/').reverse()[0]).join('\n')">{{ info.metadata.name }}</div>
      <div class="status">
        STATUS: <span title="Replicas">{{ info.status.replicas ?? 0 }}</span> / <span title="Available">{{ info.status.availableReplicas ?? 0 }}</span> / <span title="Unavailable">{{ info.status.unavailableReplicas ?? 0 }}</span>
      </div>
    </div>
    <div v-else>ALL</div>
    <a><img src="@/assets/angle_down.svg" alt="log"></a>
  </li>
</template>

<style lang="less">
@import "~@/less/proj.less";

@keyframes available-progress {
  0% { .bgc(@deploy-available); }
  50% { .bgc(@deploy-progress); }
  100% { .bgc(@deploy-available); }
}

@keyframes unavailable-progress {
  0% { .bgc(@deploy-unavailable); }
  50% { .bgc(@deploy-progress); }
  100% { .bgc(@deploy-unavailable); }
}

[deployment-item] { .bgc(@deploy-none); .br(6); .p(4,4,4,8); .flex; .items-center; .gap(10); .space-between; .monospace; .fs(12,16); .-box; .-a(@deploy-none);  .pointer; .rel;
  .status { .mt(4); .fs(11); }
  a { .block; .wh(24); .flex-no-shrink; .t-r(270deg); filter: brightness(30%); }
  &.active { .-a(#fff);
    a { filter: none; }
  }
  &:not(.all) {
    &.available { .bgc(@deploy-available);
      &.progress { animation: available-progress 1s infinite; }
    }
    &.unavailable { .bgc(@deploy-unavailable);
      &.progress { animation: unavailable-progress 1s infinite; }
    }
  }
}
</style>