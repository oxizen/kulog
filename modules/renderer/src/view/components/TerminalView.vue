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
const grepShow = ref<boolean>(false);
const grepEdit = ref<string>('');
const grep = ref<string>('');
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
const openGrep = async (v: string = '') => {
  grepShow.value = !grepShow.value;
  grepEdit.value = v;
  if (!grepShow.value) return execGrep();
  await nextTick();
  el.value?.querySelector('input')?.focus();
};

const execGrep = () => {
  if (grep.value !== grepEdit.value) {
    grep.value = grepEdit.value;
    clearTerminal();
    connection?.grep(grep.value);
  }
  if (!grep.value) grepShow.value = false;
};

const cancelGrep = () =>{
  grepEdit.value = grep.value;
  if (!grep.value) grepShow.value = false;
};

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
const maximize = async () => {
  setMaximize(el.value);
  fitAddon.fit();
  connection?.resize();
  await nextTick();
  terminal.focus();
};

const pending = ref(false);
const openWithCode = async () => {
  pending.value = true;
  await window.app.invoke('openWithCode', props.namespace, props.pod);
  pending.value = false;
};

const clearTerminal = () => {
  terminal.clear();
  terminal.clearSelection();
};

watch(logState, () => {
  if (terminated.value && !logState.pending) {
    terminated.value = false;
    clearTerminal();
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
    box.value.addEventListener('contextmenu', () => {
      const file = terminal.getSelection();
      console.log(file);
    });
    onBeforeUnmount(() => handler.dispose());
    terminal.focus();
  } else {
    box.value.addEventListener('contextmenu', () => {
      const word = terminal.getSelection();
      if (word) {
        grepShow.value = false;
        openGrep(word);
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
      <div class="grep-ui" @mousedown.stop v-if="grepShow">
        <input type="text" v-model="grepEdit" @keydown.enter="execGrep" @keydown.esc="cancelGrep">
      </div>
    </div>
    <div class="wrapper">
      <div class="box" ref="box"></div>
      <div class="resizing"></div>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
    <div class="btn-list">
      <a class="clear-button" @mousedown.stop @click="clearTerminal"><img src="@/assets/clear.svg"></a>
      <template v-if="type === 'log'">
        <a class="grep-button" :class="{ active: grepShow }" @mousedown.stop @click="openGrep()">
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M859.02 234.524l0.808-0.756 0.749-0.813c27.047-29.356 33.876-70.34 17.823-106.957-15.942-36.366-50.416-58.957-89.968-58.957H163.604c-38.83 0-73.043 22.012-89.29 57.444-16.361 35.683-10.632 76.301 14.949 106.004l0.97 1.126 280.311 266.85 2.032 312.074c0.107 16.502 13.517 29.805 29.995 29.805l0.2-0.001c16.568-0.107 29.912-13.626 29.804-30.194l-2.198-337.564-296.478-282.241c-9.526-11.758-11.426-26.933-5.044-40.851 6.446-14.059 19.437-22.452 34.75-22.452h624.828c15.6 0 28.69 8.616 35.017 23.047 6.31 14.391 3.924 29.831-6.354 41.497l-304.13 284.832 1.302 458.63c0.047 16.54 13.469 29.916 29.998 29.915h0.087c16.568-0.047 29.962-13.517 29.915-30.085L573.04 502.36l285.98-267.836z" fill="#FFF"/>
            <path d="M657.265 595.287c0 16.498 13.499 29.997 29.997 29.997h243.897c16.498 0 29.997-13.498 29.997-29.997 0-16.498-13.499-29.997-29.997-29.997H687.262c-16.498 0-29.997 13.499-29.997 29.997z m273.894 138.882H687.262c-16.498 0-29.997 13.499-29.997 29.997s13.499 29.997 29.997 29.997h243.897c16.498 0 29.997-13.499 29.997-29.997 0-16.498-13.499-29.997-29.997-29.997z m0 168.878H687.262c-16.498 0-29.997 13.499-29.997 29.997s13.499 29.997 29.997 29.997h243.897c16.498 0 29.997-13.499 29.997-29.997 0-16.498-13.499-29.997-29.997-29.997z" fill="#FFF"/>
          </svg>
        </a>
        <a class="shell-button" @mousedown.stop @click="$emit('open-shell', pod)"><img src="@/assets/shell.svg"></a>
        <a class="code-button" @mousedown.stop :class="{ pending }" @click="openWithCode"><img src="@/assets/vscode-alt.svg"></a>
      </template>
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
    img { .block; .wh(12); .-a(#fff); .br(4); .p(2,3); box-sizing: content-box; }
    span { .w(calc(100% - 128px)); .nowrap; .ellipsis;  }
    .grep-ui { .abs; .flex; .rb(0, -35); .p(2,5,6,8); .z(1000); .bgc(@panel-header); .gap(6); .br-lb(6); .min-w(200); .w(40%);
      input { .bgc(#111); .wh(100%, 27);  .p(6, 8); .c(#fff); .br(4); .monospace; }
      button { .p(6,8); .br(4); .bgc(#262626); .monospace; }
    }
  }
  .wrapper { .p(2); }
  .box { .pl(4); .wh(600,304); .crop; }
  .resize-handle { .abs; .rb; .wh(8); cursor: nwse-resize; }
  .btn-list { .abs; .rt(6,5); .flex; .gap(6); .items-center;
    img { .block; }
    a { .pointer;
      img, svg { .block; .wh(12); .-a(#fff); .br(4); .p(2,3); box-sizing: content-box; }
      &.pending { .o(0.5); .cursor; }
      &.active {
        svg { .-a(#ff4);
          path { .fill(#ff4); }
        }
      }
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
