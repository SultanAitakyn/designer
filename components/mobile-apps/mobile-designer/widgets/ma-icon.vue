<template>
  <a-icon
    :type="mobIcons.find(x=> x.value===elem.model.name) ? mobIcons.find(x=> x.value===elem.model.name).label : 'stop'"
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    :style="{
      minWidth: '12px',
      minHeight: '12px',
      ...font,
      ...margins,
      ...paddings,
      color: color(elem.model.color),
    }"
  />
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import {mobIcons} from "@/utils/mautils";


  export default {
    name: "ma-icon",
    mixins: [BaseWidget],
    data() {
      return {
        mobIcons
      }
    }
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
  }
</style>
