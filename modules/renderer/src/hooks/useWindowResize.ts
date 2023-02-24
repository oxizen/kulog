import { onBeforeUnmount } from 'vue';
export const useWindowResize = (handler: () => void) => {
  window.addEventListener('resize', handler);
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handler);
  });
};