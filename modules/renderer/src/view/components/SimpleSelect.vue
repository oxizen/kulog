<script setup lang="ts">
import { computed, PropType } from 'vue';

const props = defineProps({
  placeholder: { type: String },
  options: { type: Array as PropType<({ value: string, label: string } | string)[]>, required: true },
  value: { type: String, required: true },
});
const emit = defineEmits(['update:value']);

const getLabel = (item: { value: string, label: string } | string) => {
  const val = typeof item === 'string' ? item : item?.label;
  if (!val) return props.placeholder;
  const idx = val.indexOf('/');
  return ~idx ? val.substring(idx + 1) : val;
};

const getValue = (item: { value: string, label: string } | string) => {
  return typeof item === 'string' ? item : item?.value;
};

const model = computed<string>({
  get: () => props.value,
  set: (v: string) => emit('update:value', v),
}); 

</script>
<template>
  <select simple-select v-model="model">
    <option v-for="item in options" :value="getValue(item)" :key="item">{{ getLabel(item) }}</option>
  </select>
</template>

<style lang="less">
@import "~@/less/proj.less";

[simple-select] { .p(6, 8); .c(#fff); .br(6); background: url("@/assets/angle_down.svg") no-repeat 100% 50% @app-header; .monospace;
  option { .bgc(@app-header); .c(#fff); }
}
</style>