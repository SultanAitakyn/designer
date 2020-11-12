<template>
  <div
    style="align-self: stretch; width: auto"
    :style="{
      ...sizes,
      ...margins,
      ...paddings,
      ...borderRadiuses,
      border,
      background,
      color: color(elem.model.color),
    }"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    @click="handleClick"
  >
    <a-progress
      :percent="elem.model.value * 100 / elem.model.cap"
      :show-info="false"
      status="active"
      type="line"
      :stroke-color="(color(elem.model.color))"
    />
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-workload-bar",
    mixins: [BaseWidget],
  }
</script>

<style scoped>

</style>
