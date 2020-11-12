<template>
  <a-input
    @click.stop="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    ref="inputRef"
    style="width: 100%"
    :placeholder="'Pick ' + PICKER_TYPES[elem.model.picker_type || 0]"
    :style="{
    ...sizes,
    ...margins,
    ...paddings,
    border,
    ...borderRadiuses,
      background,
    }"
  />
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-datepicker",

    mixins: [BaseWidget],

    data() {
      return {
        PICKER_TYPES: ['datetime', 'date', 'time']
      }
    },
  };
</script>

<style scoped>
</style>
