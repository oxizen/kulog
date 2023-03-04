import { defineStore } from 'pinia';
import { ref } from 'vue';

export type DrawerState = 'OPEN' | 'CLOSED';
export const useDrawerState = defineStore('drawerState', () => {
  const state = ref<DrawerState>(localStorage.getItem('drawerState') as DrawerState || 'OPEN');
  const setState = (v: DrawerState) => {
    state.value = v;
    localStorage.setItem('drawerState', v);
  };

  return { state, setState };
});