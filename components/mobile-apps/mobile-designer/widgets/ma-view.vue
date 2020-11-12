<template>
  <div
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    :style="{
      minWidth: elem.model.width && elem.model.width.size < 1 ? '24px' : '0',
      minHeight: elem.model.width && elem.model.height.size < 1 ? '24px' : '0',
      ...sizes,
      display: 'flex',
      flexWrap: 'wrap',
      ...margins,
      ...paddings,
      ...borderRadiuses,
      border,
      background
    }"
  />
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-view",
    mixins: [BaseWidget],
  };
</script>
