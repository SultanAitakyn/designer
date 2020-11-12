<template>
  <span
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    style="display: flex; align-items: center; justify-content: center"
    :style="{
      minWidth: '12px',
      minHeight: '12px',
      textAlign: 'center',
      ...sizes,
      ...margins,
      ...paddings,
      ...borderRadiuses,
      ...font,
      color: color(elem.model.color),
      border: border || '1px dashed rgba(0,0,0,.25)',
      background,
    }"
  >
    {{ elem.model.title }}
  </span>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";

  export default {
    name: "ma-button",
    mixins: [BaseWidget],
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
  }
</style>
