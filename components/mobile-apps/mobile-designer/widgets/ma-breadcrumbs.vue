<template>
  <div
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    :style="{
      background,
      color: color(elem.model.color),
    }"
  >
    <a-breadcrumb class="pa-2" :style="{color: color(elem.model.color)}">
      <span slot="separator" :style="{color: color(elem.model.color)}">></span>
      <a-breadcrumb-item>{{ elem.model.title }}</a-breadcrumb-item>
      <a-breadcrumb-item :style="{color: color(elem.model.color)}">list</a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-breadcrumbs",
    mixins: [BaseWidget],
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
  }
</style>
