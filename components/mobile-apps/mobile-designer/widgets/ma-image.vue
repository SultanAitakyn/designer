<template>
  <span
    style="flex-shrink: 0; display: flex; justify-content: center; align-items: center"
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    :style="{
      ...sizes,
      ...margins,
      ...paddings,
      ...borderRadiuses,
      border,
      background: background || 'rgba(0,0,0,.1)',
    }"
  >
    <img
      v-if="elem.model.imageURI && !elem.model.data_field_id"
      :src="elem.model.imageURI"
      alt=""
      style="max-width: 100%; max-height: 100%"
    >
    <img
      v-else-if="elem.model.thumb_url && !elem.model.imageURI && !elem.model.data_field_id"
      :src="elem.model.thumb_url"
      alt=""
      style="max-width: 100%; max-height: 100%"
    >
    <a-icon v-else type="picture"/>
  </span>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-image",
    mixins: [BaseWidget],
    beforeMount() {
      if (!this.elem.model.background)
        this.elem.model.background = {color: {hex: "#ffffff", name: ''}, image: null};
    },
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
  }
</style>
