import { defineStore } from 'pinia';
import { ref } from 'vue';

export type AlignType = 'F' | 'V' | 'H';
export const useAlignState = defineStore('alignState', () => {
  const align = ref<AlignType>(localStorage.getItem('alignType') as AlignType || 'F');
  const setAlign = async (v: AlignType) => {
    align.value = v;
    localStorage.setItem('alignType', v);
  };

  return { align, setAlign };
});