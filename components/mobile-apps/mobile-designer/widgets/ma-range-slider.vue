<template>
  <div
    @click.stop="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    style="width: 100%;"
    :style="{
      ...sizes,
      ...margins,
      ...paddings,
      border,
      ...borderRadiuses,
      background
    }"
  >
    <div
      v-if="elem.model.placeholder"
      style="margin-bottom: 8px;"
    >
      {{ elem.model.placeholder }}
    </div>
    <a-slider range :default-value="[20, 80]"/>
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-range-slider",
    mixins: [BaseWidget],
  };
</script>

<style scoped>

</style>
