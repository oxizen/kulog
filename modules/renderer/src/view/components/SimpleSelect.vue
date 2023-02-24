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
  <select v-model="model">
    <option v-for="item in options" :value="getValue(item)" :key="item">{{ getLabel(item) }}</option>
  </select>
</template>