<template>
  <div
    @click.stop="handleClick"
    :class="{selected: selectedElem === elem && !disableDrag}"
    style="display: inline-block"
    :style="{...margins}"
  >
    <div
      v-if="elem.model.placeholder"
      style="margin-bottom: 8px;"
      :style="{...font}"
    >
      {{ elem.model.placeholder }}
    </div>
    <div
      class="uploader"
      style="border: 1px dashed #d9d9d9; border-radius: 4px; cursor: pointer; "
      :style="{...sizes, ...paddings, border, ...borderRadiuses, background}"
    >
      <a-icon type="plus-circle" style="font-size: 24px; color: rgba(0,0,0,.4)"/>
      <div style="margin-top: 8px; color: rgba(0,0,0,.6);">
        Upload
      </div>
    </div>
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-filepicker",
    mixins: [BaseWidget],
  };
</script>

<style scoped>
  .uploader {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 128px;
    height: 128px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    background-color: #fafafa;
    text-align: center;
    cursor: pointer;
    transition: border-color .2s ease;
  }
  .uploader:hover {
    border-color: #1890ff;
  }
</style>
