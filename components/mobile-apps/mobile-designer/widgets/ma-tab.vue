<template>
  <div
    @click="handleClick"
    :style="{
      width: 'fit-content',
      minWidth: '16px',
      height: '80%',
      display: 'flex',
      flexDirection: 'column',
      margin: '4px',
      ...paddings,
      borderStyle: 'solid',
      border: '0.5px',
      justifyContent: 'space-around',
      alignItems: 'center',
    }"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
  >
    <div style="display: flex; justify-content: center; align-items: center;">
      <!--      <a-icon v-if="mobIcons.find(x=> x.value===element.model.icon.name)"-->
      <!--              style="margin-right: 6px;"-->
      <!--              :type="mobIcons.find(x=> x.value===element.model.icon.name).label"/>-->
      <div v-if="elem.model.data">{{ elem.model.data }}</div>
    </div>
  </div>
</template>

<script>
  import ContainerScreenWidget from "@/components/mobile-apps/mobile-designer/widgets/ContainerScreenWidget";


  export default {
    name: "ma-tab",
    mixins: [ContainerScreenWidget],
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0 0 4px 0 #00adff;
  }

  .tab-button {
    background-color: inherit;
    float: left;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 16px;
    transition: 0.3s;
  }
</style>
