<template>
  <div
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
    <a-rate
      :value="elem.model.value"
      :default-value="3"
      disabled
      :count="elem.model.cap"
      :style="{
        color: color(elem.model.color),
      }"
    />
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-rating",
    mixins: [BaseWidget],
  }
</script>
