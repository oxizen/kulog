<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import TerminalView from '@/view/components/TerminalView.vue';
import { useLogState } from '@/stores/logState';
import { setPositions } from '@/utils/panelUtil';
import { useAlignState } from '@/stores/alignState';
import { useWindowResize } from '@/hooks/useWindowResize';
import debounce from 'debounce';
const alignState = useAlignState();
const logState = useLogState();
const orderList = ref<string[]>([]);
const el = ref<HTMLElement | null>( null);
const terminals = ref<TerminalView[]>( []);
const align = () => {
  setPositions(el.value, alignState.align);
  terminals.value?.forEach(t => t.fit());
};
watch(logState, () => {
  orderList.value = logState.logList.map(l => l.pod);
  nextTick(() => {
    if (!el.value) return;
    align();
  });
});

const alignWhenFit = debounce(() => {
  if (alignState.align === '·') return;
  align();
}, 500);

watch(alignState, alignWhenFit);
useWindowResize(alignWhenFit);
const orderUp = (pod: string) => {
  orderList.value = [...orderList.value.filter(p => p !== pod), pod];
};
</script>

<template>
  <div app-home ref="el">
    <TerminalView v-for="log in logState.logList" :key="log.pod" :pod="log.pod" :namespace="log.namespace" :style="{ zIndex: orderList.indexOf(log.pod) }" @order-up="orderUp" ref="terminals" />
  </div>
</template>

<style lang="less">
@import "~@/less/proj.less";

[app-home] { .rel; .flex-grow; }
</style>
