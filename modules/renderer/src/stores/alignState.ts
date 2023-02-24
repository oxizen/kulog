import { defineStore } from 'pinia';
import { ref } from 'vue';

export type AlignType = '·' | 'ㄱ' | 'ㄴ';
export const useAlignState = defineStore('alignState', () => {
  const align = ref<AlignType>(localStorage.getItem('alignType') as AlignType || '·');
  const setAlign = async (v: AlignType) => {
    align.value = v;
    localStorage.setItem('alignType', v);
  };

  return { align, setAlign };
});