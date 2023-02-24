<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useConnectLog } from '@/hooks/useConnectLog';
import { setDrag, setResize } from '@/utils/panelUtil';
import { useAlignState } from '@/stores/alignState';

const props = defineProps({
  namespace: { type: String, required: true },
  pod: { type: String, required: true },
});
defineEmits(['order-up']);
defineExpose({ fit: () => fitAddon.fit()});

const alignState = useAlignState();
const el = ref<HTMLElement | null>(null);
const box = ref<HTMLElement | null>(null);
const killed = ref<boolean>(false);
const resizing = ref<boolean>(false);
const terminal = new Terminal({
  cursorBlink: true,
  cursorStyle: 'bar',
  screenReaderMode: true,
  disableStdin: true,
  fontSize: 12,
  lineHeight: 1.4,
});
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

const startDrag = (e: MouseEvent) => setDrag(e, el.value, () => {
  alignState.setAlign('·');
});
const startResize = (e:MouseEvent) => {
  resizing.value = true;
  setResize(e, box.value, () => {
    fitAddon.fit();
    resizing.value = false;
    alignState.setAlign('·');
  });
};

onBeforeUnmount(() => terminal.dispose());
onMounted(async () => {
  terminal.open(box.value!);
  fitAddon.fit();
  await useConnectLog(props.namespace, props.pod, (log, killEvent) => {
    if (killEvent) killed.value = true;
    terminal.write(log);
  });
});
</script>

<template>
  <div terminal-view :class="{ killed, resizing }" ref="el" @mousedown="$emit('order-up', pod)">
    <div class="pod-header" @mousedown="startDrag">{{ pod }}<span v-if="killed"> (KILLED)</span></div>
    <div class="wrapper">
      <div class="box" ref="box"></div>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
  </div>
</template>

<style lang="less">
@import "~@/less/proj.less";

[terminal-view] { .-a(@panel-border); .bgc(@panel-bg); .abs; .z(1); .select-none;
  .pod-header { .bgc(@panel-header); .c(@panel-title); .p(5,10); .rel; .nowrap; .ellipsis; }
  .wrapper { .p(2); }
  .box { .pl(4); .wh(600,304); .crop; }
  .resize-handle { .abs; .rb; .wh(8); cursor: nwse-resize; }
  &.killed { .o(0.5); }
  &.resizing .box { filter: blur(2px); }
}
</style>