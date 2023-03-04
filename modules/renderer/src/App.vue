<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from '@/view/components/layout/AppHeader.vue';
import AppDrawer from '@/view/components/layout/AppDrawer.vue';
import { useDrawerState } from '@/stores/drawerState';
const drawerState = useDrawerState();
</script>

<template>
  <AppHeader />
  <div route-area>
    <AppDrawer v-if="drawerState.state === 'OPEN'" />
    <RouterView />
  </div>
</template>

<style lang="less">
@import "~@/less/proj.less";

[route-area] { .flex; .hf; }
</style>
