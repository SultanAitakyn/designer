<template>
  <a-input-group size="small" compact style="display: flex">
    <a-input-number
      size="small"
      v-model.number="value.size"
      :min="-1"
      :formatter="value => value < 0 ? 'auto' : value"
      @change="$emit('input', value)"
      style="width: auto;"
      :default-value="-1"
    />

    <a-select
      size="small"
      v-model="value.unit"
      :default-value="0"
      @change="$emit('input', value)"
    >
      <a-select-option v-for="unit in sizeUnits" :key="unit.value">{{ unit.label }}</a-select-option>
    </a-select>
  </a-input-group>
</template>

<script>
  import {sizeUnits} from '@/utils/mautils';


  export default {
    name: "SizeSetting",
    props: {
      value: Object,
    },
    data() {
      return {
        sizeUnits
      }
    },
    created() {
      if (!this.value.size) this.value.size = -1
      if (this.value.unit === undefined) this.value.unit = 1
    }
  }
</script>
