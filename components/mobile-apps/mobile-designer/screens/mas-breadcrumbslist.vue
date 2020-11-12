<template>
  <div
    v-if="screen"
    style="display: grid"
    :style="{background, gridTemplateRows: !hideHeader ? 'auto auto 1fr' : 'auto 1fr'}"
  >
    <ScreenHeader v-if="!hideHeader" :screen="screen"/>

    <ma-breadcrumbs
      :parentScreen="screen.model.model.key"
      :elem="screen.model.model.breadcrumbs"
    />

    <div class="mobile-scrollbar" style="overflow-y: auto">
      <a-row key="0">
        <a-col style="width: auto;">
          <component
            v-for="elem in screen.model.model.children"
            :is="widgetTypes.find(x=> x.enum_id===elem.type) ? widgetTypes.find(x=> x.enum_id===elem.type).type : ''"
            :disableDrag="false"
            :parentScreen="screen.model.model.key"
            :isRootStack="true"
            :elem="elem"
            :key="elem.model.key"
          />
        </a-col>
      </a-row>
      <a-row v-for="idx in [1,2,3,4]" :key="idx">
        <a-col style="opacity: 0.5;">
          <component
            :is="widgetTypes.find(x=> x.enum_id===elem.type) ? widgetTypes.find(x=> x.enum_id===elem.type).type : ''"
            :disableDrag="true"
            :parentScreenKey="screen.model.model.key"
            :isRootStack="true"
            v-for="elem in screen.model.model.children"
            :elem="elem"
            :key="elem.model.key+idx"
          />
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
  import BaseScreen from "@/components/mobile-apps/mobile-designer/screens/BaseScreen";
  import ScreenHeader from "@/components/mobile-apps/mobile-designer/screens/ScreenHeader";
  import maStack from "@/components/mobile-apps/mobile-designer/widgets/ma-stack";
  import maBreadcrumbs from "@/components/mobile-apps/mobile-designer/widgets/ma-breadcrumbs";


  export default {
    name: "mas-breadcrumbslist",
    mixins: [BaseScreen],
    components: {
      ScreenHeader,
      'ma-stack': maStack,
      'ma-breadcrumbs': maBreadcrumbs,
    },
  };
</script>
