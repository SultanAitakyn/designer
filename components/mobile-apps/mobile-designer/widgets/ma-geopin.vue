<template>
  <div
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    style="width: 100%; padding: 4px 8px"
  >
    <a-icon
      v-if="mobIcons.find(x=> x.value===elem.model.icon.name)"
      :type="mobIcons.find(x=> x.value===elem.model.icon.name).label"
    />
    {{ elem.model.name }}
    <component
      v-for="elem in elem.model.children"
      :is="widgetTypes.find(x=> x.enum_id===elem.type) ? widgetTypes.find(x=> x.enum_id===elem.type).type : ''"
      :disableDrag="false"
      :parentScreenKey="parentScreenKey"
      :elem="elem"
      :key="elem.model.key"
    />
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-geopin",
    mixins: [BaseWidget],
    components: {
      'ma-stack': () => import('@/components/mobile-apps/mobile-designer/widgets/ma-stack'),
    },
    data() {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        mapOptions: {
          zoomSnap: 0.5,
        },
      }
    },
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
  }
</style>
