<template>
  <div
    @click="handleClick"
    :style="{
      width: '80px',
      height: '80%',
      display: 'flex',
      flexDirection: 'column',
      margin: '4px',
      padding: '4px',
      borderStyle: 'solid',
      border: '0.5px',
      justifyContent: 'space-around',
      alignItems: 'center',
    }"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
  >
    <div>
      <a-icon
        v-if="mobIcons.find(x=> x.value===elem.model.icon.name)"
        :type="mobIcons.find(x=> x.value===elem.model.icon.name).label"
      />
    </div>
    <div v-if="elem.model.data">{{ elem.model.data }}</div>
  </div>
</template>

<script>
  import ContainerScreenWidget from "@/components/mobile-apps/mobile-designer/widgets/ContainerScreenWidget";

  export default {
    name: "ma-bottomnavelem",
    mixins: [ContainerScreenWidget],
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
    background: #e0e0e0;
  }
</style>
