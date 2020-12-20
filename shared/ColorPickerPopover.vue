<template>
  <a-space>
    <a-popover
      overlay-class-name="color-picker-popover"
      trigger="click"
      :get-popup-container="trigger => trigger.parentNode"
    >
      <a-button
        class="color-picker-button"
        :size="size"
        shape="circle"
        :style="{
          color: hex || '#fff',
          background: hex || `url(${ require('@/assets/img/mobile-designer/color-bg.svg')}) repeat`
        }"
      >.</a-button>

      <chrome-picker
        slot="content"
        :value="hex"
        style="box-shadow: none"
        @input="$emit('change', $event.hex)"
      />
    </a-popover>

    <a v-if="hex && !disableClear" href="#" @click.prevent="$emit('change', '')">
      <a-icon type="delete" style="color: red"/>
    </a>
  </a-space>
</template>

<script>
  import {Chrome} from "vue-color";


  export default {
    name: "ColorPickerPopover",
    components: {
      "chrome-picker": Chrome,
    },
    model: {
      prop: 'hex',
      event: 'change'
    },
    props: {
      hex: {
        type: String,
        default: ''
      },
      size: String,
      disableClear: Boolean
    },
  }
</script>

<style>
  .color-picker-popover .ant-popover-inner {
    overflow: hidden;
  }

  .color-picker-popover .ant-popover-inner-content {
    padding: 0;
  }
</style>
