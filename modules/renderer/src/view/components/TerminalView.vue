<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useConnectLog } from '@/hooks/useConnectLog';
import { setDrag, setResize } from '@/utils/panelUtil';
import { useAlignState } from '@/stores/alignState';
import { useLogState } from '@/stores/logState';
let connection: { resize: (cols: number, rows: number) => void, reconnect: () => void } | undefined;
const logState = useLogState();
const props = defineProps({
  namespace: { type: String, required: true },
  pod: { type: String, required: true },
});
defineEmits(['order-up']);
defineExpose({ fit: () => {
  fitAddon.fit();
  connection?.resize(terminal.cols, terminal.rows);
}});

const alignState = useAlignState();
const el = ref<HTMLElement | null>(null);
const box = ref<HTMLElement | null>(null);
const terminated = ref<boolean>(false);
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
  alignState.setAlign('F');
});
const startResize = (e:MouseEvent) => {
  resizing.value = true;
  setResize(e, box.value, async () => {
    fitAddon.fit();
    await nextTick();
    connection?.resize(terminal.cols, terminal.rows);
    resizing.value = false;
    alignState.setAlign('F');
  });
};

const pending = ref(false);
const openWithCode = async () => {
  pending.value = true;
  await window.app.invoke('openWithCode', props.namespace, props.pod);
  pending.value = false;
};

watch(logState, () => {
  if (terminated.value && !logState.pending) {
    terminated.value = false;
    terminal.clear();
    connection?.reconnect();
  }
});
onBeforeUnmount(() => terminal.dispose());
onMounted(async () => {
  terminal.open(box.value!);
  fitAddon.fit();
  await nextTick();
  connection = await useConnectLog(props.namespace, props.pod, terminal.cols, terminal.rows, (log, killEvent) => {
    if (killEvent) terminated.value = true;
    terminal.write(log);
  });
});
</script>

<template>
  <div terminal-view :class="{ terminated, resizing }" ref="el" @mousedown="$emit('order-up', pod)">
    <div class="pod-header" @mousedown="startDrag">{{ pod }}</div>
    <div class="wrapper">
      <div class="box" ref="box"></div>
      <div class="resizing"></div>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
    <div class="code-button" :class="{ pending }" @click="openWithCode"></div>
  </div>
</template>

<style lang="less">
@import "~@/less/proj.less";

[terminal-view] { .-a(@panel-border); .bgc(@panel-bg); .abs; .z(1); .select-none;
  .pod-header { .bgc(@panel-header); .c(@panel-title); .p(5,10); .rel; .nowrap; .ellipsis; }
  .wrapper { .p(2); }
  .box { .pl(4); .wh(600,304); .crop; }
  .resize-handle { .abs; .rb; .wh(8); cursor: nwse-resize; }
  .code-button { .abs; .rt(6,4); .wh(20); .pointer; background: url("@/assets/vscode-alt.svg");
    &.pending { .o(0.5); .cursor; }
  }
  &.terminated { filter: brightness(50%); }
  &.resizing .box { .hidden; }
}
</style>
