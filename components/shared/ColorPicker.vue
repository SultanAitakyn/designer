<template>
  <span style="display: inline-block; vertical-align: middle; margin-bottom: -4px; position: relative">
    <div
      :style="{
        backgroundColor: value,
        width: '45px',
        height: '24px',
        border: '1px solid gray',
        borderRadius: '4px'
      }"
      style="display: inline-block"
      @click="show = true"
    />
    <div class="color-picker" v-if="show">
      <a-icon
        type="close"
        @click.stop="show = false"
        style="padding: 5px 0 5px 5px;"
      />
      <chrome-picker :value="value" @input="handleInput"/>
    </div>
  </span>
</template>

<script>
  import { Chrome } from "vue-color";

  export default {
    name: "ColorPicker",
    components: {
      "chrome-picker": Chrome,
    },
    props: ['value'],
    data() {
      return {
        show: false,
      }
    },
    methods: {
      handleInput(e) {
        this.$emit('input', e.hex)
      }
    }
  }
</script>

<style scoped>
  .color-picker {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    height: fit-content;
    width: fit-content;
    position: absolute;
    margin-top: -27px;
    z-index: 9999;
  }
</style>
