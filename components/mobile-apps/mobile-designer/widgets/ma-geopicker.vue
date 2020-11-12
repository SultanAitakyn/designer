<template>
    <a-input
      :placeholder="elem.model.placeholder || 'Pick a geopoint'"
      @click.stop="handleClick"
      :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
      :style="{
      ...sizes,
      ...margins,
      ...paddings,
      border,
      ...borderRadiuses,
        background,
    }"
    >
    </a-input>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-geopicker",
    mixins: [BaseWidget],
  };
</script>
