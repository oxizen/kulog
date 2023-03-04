<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import TerminalView from '@/view/components/TerminalView.vue';
import { useLogState } from '@/stores/logState';
import { setPositions } from '@/utils/panelUtil';
import { useAlignState } from '@/stores/alignState';
import { useWindowResize } from '@/hooks/useWindowResize';
import { useDrawerState } from '@/stores/drawerState';

import debounce from 'debounce';

const alignState = useAlignState();
const logState = useLogState();
const drawerState = useDrawerState();

const podList = ref<PodList>([]);
const orderList = ref<string[]>([]);
const el = ref<HTMLElement | null>( null);
const terminals = ref<TerminalView[]>( []);
const align = () => {
  setPositions(el.value, alignState.align);
  terminals.value?.forEach(t => t.fit());
};
watch(logState, async () => {
  podList.value = logState.state ? await window.app.invoke<PodList>('getPods', logState.state.namespace, logState.state.filter) : [];
  orderList.value = podList.value.map(l => l.NAME);
  logState.setPending(false);
  await nextTick();
  if (!el.value) return;
  align();
});

const alignWhenFit = debounce(() => {
  if (alignState.align === 'F') return;
  align();
}, 500);

watch(alignState, alignWhenFit);
watch(drawerState, alignWhenFit);
useWindowResize(alignWhenFit);
const orderUp = (pod: string) => {
  orderList.value = [...orderList.value.filter(p => p !== pod), pod];
};
</script>

<template>
  <div app-home ref="el">
    <TerminalView v-for="pod in podList" :key="pod.NAME" :pod="pod.NAME" :namespace="logState.state?.namespace" :style="{ zIndex: orderList.indexOf(pod.NAME) }" @order-up="orderUp" ref="terminals" />
  </div>
</template>

<style lang="less">
@import "~@/less/proj.less";

[app-home] { .rel; .flex-grow; }
</style>
