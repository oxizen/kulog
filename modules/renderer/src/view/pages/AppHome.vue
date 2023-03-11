<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import TerminalView from '@/view/components/TerminalView.vue';
import { useLogState } from '@/stores/logState';
import { alignLogViews } from '@/utils/panelUtil';
import { useAlignState } from '@/stores/alignState';
import { useWindowResize } from '@/hooks/useWindowResize';
import { useDrawerState } from '@/stores/drawerState';

import debounce from 'debounce';
import { sleep } from '@main/utils';

const alignState = useAlignState();
const logState = useLogState();
const drawerState = useDrawerState();

const logList = ref<string[]>([]);
const shellList = ref<string[]>([]);
const orderList = ref<string[]>([]);
const el = ref<HTMLElement | null>( null);
const logViews = ref<TerminalView[]>( []);
const shellViews = ref<TerminalView[]>( []);
const align = () => {
  alignLogViews(el.value, alignState.align);
  logViews.value?.forEach(t => t.fit());
};
watch(logState, async () => {
  logList.value = logState.state ? (await window.app.invoke<PodList>('getPods', logState.state.namespace, logState.state.filter)).map(p => p.NAME) : [];
  shellList.value = [];
  orderList.value = logList.value.map(l => l + '-log');
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
const orderUp = (id: string) => {
  orderList.value = [...orderList.value.filter(p => p !== id), id];
};
const openShell = async (pod: string) => {
  if (shellList.value.includes(pod)) {
    shellViews.value?.find(t => t.pod === pod).focus();
    return orderUp(pod + '-shell');
  }
  await sleep(100);
  orderList.value.push(pod + '-shell');
  shellList.value.push(pod);
};
const closeShell = (pod: string) => {
  shellList.value = shellList.value.filter(p => p !== pod);
  orderList.value = orderList.value.filter(p => p !== pod + '-shell');
};
window.addEventListener('keydown', e => {
  const metaOrCtrl = e.metaKey || e.ctrlKey;
  if (metaOrCtrl && e.code === 'KeyW') {
    e.preventDefault();
    const focusPanel = orderList.value[orderList.value.length - 1];
    if (focusPanel && focusPanel.endsWith('-shell')) {
      closeShell(focusPanel.substring(0, focusPanel.length - 6));
    }
  }
});
</script>

<template>
  <div app-home ref="el">
    <TerminalView v-for="pod in logList" :key="pod+'-log'" :pod="pod" :namespace="logState.state?.namespace" :style="{ zIndex: orderList.indexOf(pod + '-log') }" @order-up="orderUp" @open-shell="openShell" ref="logViews" type="log" />
    <TerminalView v-for="pod in shellList" :key="pod+'-shell'" :pod="pod" :namespace="logState.state?.namespace" :style="{ zIndex: orderList.indexOf(pod + '-shell') }" @order-up="orderUp" @close-shell="closeShell" ref="shellViews" type="shell" />
  </div>
</template>

<style lang="less">
@import "~@/less/proj.less";

[app-home] { .rel; .flex-grow; }
</style>
