<script setup lang="ts">
import { useKubeConfig } from '@/stores/kubeConfig';
import { useAlignState } from '@/stores/alignState';
import { useDrawerState } from '@/stores/drawerState';
import { useLogState } from '@/stores/logState';
import { useKubeState } from '@/stores/kubeState';
import { ref } from 'vue';

const kubeConfig = useKubeConfig();
const logState = useLogState();
const alignState = useAlignState();
const drawerState = useDrawerState();
useKubeState();
kubeConfig.init();
const toggleDrawer = () => {
  drawerState.setState(drawerState.state === 'OPEN' ? 'CLOSED' : 'OPEN');
};

const getLabel = (val: string) => {
  if (!val) return '';
  const idx = val.indexOf('/');
  return ~idx ? val.substring(idx + 1) : val;
};
const close = () => window.app.invoke('quitApp');

const pending = ref(false);
const openWithCode = async () => {
  pending.value = true;
  await window.app.invoke('openWithCodeAll', logState.state?.namespace, logState.pods?.join(','));
  pending.value = false;
};

</script>
<template>
  <header app-header>
    <button class="drawer-switch" :class="{ open: drawerState.state === 'OPEN' }" @click="toggleDrawer"><img src="@/assets/double_arrow.svg"></button>
    <h1><img src="@/assets/KULOG.svg" alt="KULOG"></h1>
    <span class="badge">{{ getLabel(kubeConfig.context) }}</span>
    <template v-if="logState.state">
      <span class="badge">{{ logState.state?.namespace }}</span>
      <span class="badge">{{ logState.state?.deployment || 'ALL' }}</span>
      <button class="refresh" @click="logState.setPending(true)" :class="{ pending: logState.pending }">
        <img src="@/assets/refresh.svg" alt="refresh">
      </button>
    </template>
    <div class="handle"></div>
    <a class="code-button" v-if="logState.state" @mousedown.stop @click="openWithCode"><img src="@/assets/vscode-alt.svg"></a>
    <ul class="align">
      <li v-for="v in 'VH'" :key="v" :class="{ active: v === alignState.align }" @click="alignState.setAlign(v)">
        <i class="icon-view_column" :class="v"></i>
      </li>
    </ul>
    <button class="close" @click="close"><img src="@/assets/close.svg" alt="close"></button>
    <div class="spinner" v-if="pending"></div>
  </header>
</template>

<style lang="less">
@import "~@/less/proj.less";
[app-header] { .bgc(@app-header); .flex; .items-center; .sticky; .rel; .h(var(--header-height)); .z(1000); .gap(10); .pl(10);
  img { .block; }
  h1 { .app-drag; .mr(10); }
  .drawer-switch {
    &.open { .t-r(180deg); }
    img { .wh(27); }
  }
  .badge { .monospace; .bgc(#444); .br(4); .p(2,4); .app-drag; }
  .refresh {
    &.pending { .events-none;
      img { animation: rotation 0.7s infinite linear; }
    }
  }
  .handle { .h(var(--header-height)); .flex-grow; .app-drag; }
  .align { .flex; .monospace; .bgc(#444); .fs(18); .br(4); .crop;
    li { .pointer; .flex; .items-center; .justify-center; .fs(24); .p(2,4);
      i.H { .t-r(90deg); }
      &.active { .bgc(#666); }
    }
    li + li { .-l(#555); }
  }
  .close { .p(0, 5); }
  .spinner { .fix; .lt-c; .t-xyc;
    &:after { .cnt; .block; .wh(32); .mh-c; .-a(transparent, 6); .-v(#999, 6); .br(100%); animation: rotation .8s ease infinite; }
  }
}
</style>
