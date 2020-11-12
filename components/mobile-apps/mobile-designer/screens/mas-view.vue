<template>
  <div
    v-if="screen"
    style="display: grid; min-height: 100%"
    :style="{background, gridTemplateRows: !hideHeader ? 'auto 1fr' : '1fr'}"
  >
    <ScreenHeader v-if="!hideHeader" :screen="screen"/>

    <div class="mobile-scrollbar" style="overflow-y: auto">
      <component
        v-for="elem in screen.model.model.children"
        :is="widgetTypes.find(x=> x.enum_id===elem.type) ? widgetTypes.find(x=> x.enum_id===elem.type).type : ''"
        :disableDrag="false"
        :isRootStack="true"
        :parentScreenKey="screen.model.model.key"
        :elem="elem"
        :key="elem.model.key"
        style="min-height: 100%"
      />
    </div>
  </div>
</template>

<script>
  import BaseScreen from "@/components/mobile-apps/mobile-designer/screens/BaseScreen";
  import ScreenHeader from "@/components/mobile-apps/mobile-designer/screens/ScreenHeader";
  import maStack from "@/components/mobile-apps/mobile-designer/widgets/ma-stack";

  export default {
    name: "mas-view",
    mixins: [BaseScreen],
    components: {
      ScreenHeader,
      'ma-stack': maStack,
    },
  };
</script>
