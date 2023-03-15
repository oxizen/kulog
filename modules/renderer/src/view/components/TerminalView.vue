<script setup lang="ts">
/* eslint-disable no-undef */
import { nextTick, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useConnectPod } from '@/hooks/useConnectPod';
import { setDrag, setMaximize, setResize, setSinglePosition } from '@/utils/panelUtil';
import { useAlignState } from '@/stores/alignState';
import { useLogState } from '@/stores/logState';

let connection: { resize: () => void, reconnect: () => void, send: (data: string) => void, grep: (str: string) => Promise<void> } | undefined;
const logState = useLogState();
const props = defineProps({
  namespace: { type: String, required: true },
  pod: { type: String, required: true },
  type: { type: String as PropType<ConnectType>, default: 'log' }
});
const emit = defineEmits(['order-up', 'open-shell', 'close-shell']);
defineExpose({
  fit: () => {
    fitAddon.fit();
    connection?.resize();
  },
  focus: async () => {
    terminal.focus();
  },
  pod: props.pod,
});

const alignState = useAlignState();
const el = ref<HTMLElement | null>(null);
const box = ref<HTMLElement | null>(null);
const terminated = ref<boolean>(false);
const resizing = ref<boolean>(false);
const terminal = new Terminal({
  cursorBlink: true,
  cursorStyle: 'bar',
  screenReaderMode: props.type === 'log',
  disableStdin: props.type === 'log',
  fontSize: 12,
  lineHeight: 1.4,
});
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

const startDrag = (e: MouseEvent) => setDrag(e, el.value, () => {
  if (props.type === 'log') alignState.setAlign('F');
  terminal.focus();
});
const startResize = (e:MouseEvent) => {
  resizing.value = true;
  setResize(e, box.value, async () => {
    fitAddon.fit();
    connection?.resize();
    resizing.value = false;
    if (props.type === 'log') alignState.setAlign('F');
    await nextTick();
    terminal.focus();
  });
};
const maximize = () => setMaximize(el.value);

const pending = ref(false);
const openWithCode = async () => {
  pending.value = true;
  await window.app.invoke('openWithCode', props.namespace, props.pod);
  pending.value = false;
};

const clearTerminal = () => {
  terminal.clear();
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
  if (!box.value) return;
  terminal.open(box.value);
  if (props.type === 'shell') {
    const handler = terminal.onData(data => connection?.send(data));
    setSinglePosition(el.value);
    onBeforeUnmount(() => handler.dispose());
    terminal.focus();
  } else {
    box.value.addEventListener('contextmenu', () => {
      const word = terminal.getSelection();
      if (word) {
        terminal.clear();
        connection?.grep(word);
      }
    });
  }
  fitAddon.fit();
  connection = await useConnectPod(props.type, props.namespace, props.pod, terminal, (stdout, killEvent) => {
    if (killEvent) {
      terminated.value = true;
      if (props.type === 'shell') emit('close-shell', props.pod);
    }
    terminal.write(stdout);
  });
});
</script>

<template>
  <div terminal-view :class="[type, { terminated, resizing }]" ref="el" @mousedown="$emit('order-up', pod + '-' + type)">
    <div class="pod-header" @mousedown="startDrag" @dblclick="maximize">
      <img src="@/assets/log.svg" v-if="type === 'log'">
      <img src="@/assets/shell.svg" v-else>
      <span>{{ pod }}</span>
    </div>
    <div class="wrapper">
      <div class="box" ref="box"></div>
      <div class="resizing"></div>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
    <div class="btn-list">
      <template v-if="type === 'log'">
        <a class="shell-button" @mousedown.stop @click="$emit('open-shell', pod)"><img src="@/assets/shell.svg"></a>
        <a class="code-button" @mousedown.stop :class="{ pending }" @click="openWithCode"><img src="@/assets/vscode-alt.svg"></a>
      </template>
      <a class="clear-button" @mousedown.stop @click="clearTerminal"><img src="@/assets/discard.svg"></a>
      <template v-if="type === 'shell'">
        <a class="close-button" @mousedown.stop @click="$emit('close-shell', pod)"><img src="@/assets/close.svg"></a>
      </template>
    </div>
  </div>
</template>

<style lang="less">
@import "~@/less/proj.less";

[terminal-view] { .-a(@panel-border); .bgc(@panel-bg); .abs; .z(1); .select-none;
  .pod-header { .bgc(@panel-header); .c(@panel-title); .p(5,10,5,6); .rel; .flex; .items-center; .gap(6); .monospace;
    img { .block; .wh(14); .-a(#fff); .br(4); .p(1,2); box-sizing: content-box; }
    span { .w(calc(100% - 100px)); .nowrap; .ellipsis;  }
  }
  .wrapper { .p(2); }
  .box { .pl(4); .wh(600,304); .crop; }
  .resize-handle { .abs; .rb; .wh(8); cursor: nwse-resize; }
  .btn-list { .abs; .rt(6,5); .flex; .gap(8); .items-center;
    img { .block; }
    .code-button { .pointer;
      img { .wh(18); }
      &.pending { .o(0.5); .cursor; }
    }
    .shell-button { .pointer;
      img { .block; .wh(14); .-a(#fff); .br(4); .p(1,2); box-sizing: content-box; }
    }
    .close-button { .pointer;
      img { .wh(18); }
    }
    .clear-button { .pointer;
      img { .wh(18); }
    }
  }
  &.terminated { filter: brightness(50%); }
  &.resizing .box { .hidden; }
  &.shell { .-a(@shell-border);
    .pod-header { .bgc(@shell-header);
      span { .w(calc(100% - 70px)); }
    }
  }
  .terminal .xterm-viewport { .bgc(@panel-bg) !important; }
  .terminal.focus .xterm-viewport { .bgc(@panel-bg-focused) !important; }
  &:has(.terminal.focus) { .bgc(@panel-bg-focused); }
}
</style>
