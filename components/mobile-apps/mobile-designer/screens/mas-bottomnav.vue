<template>
  <div
    v-if="screen"
    style="display: grid; grid-template-rows: 1fr auto"
    :style="{background}"
  >
    <div class="mobile-scrollbar" style="overflow-y: auto" :class="{'centered-message': !childScreen}">
      <component
        v-if="childScreen && childScreen.model"
        :hideHeader="false"
        :key="childScreen.model.model.key"
        :is="screenTypes.find(x=> x.enum_id===childScreen.model.type) ? screenTypes.find(x=> x.enum_id===childScreen.model.type).type : ''"
        :screen="childScreen"
        style="height: 100%"
      />
      <p v-if="!childScreen">
        <b>No screen designated for this button</b><br> Select target screen in button settings
      </p>
    </div>

    <draggable
      class="screen-footer"
      :list="screen.model.model.children"
      :group="{ name: 'elements', pull: true, put: true }"
      :sort="true"
      :animation="350"
      :disabled="$store.state.globalDragDisabled"
    >
      <component
        v-for="elem in screen.model.model.children"
        :is="widgetTypes.find(x=> x.enum_id === elem.type) ? widgetTypes.find(x=> x.enum_id === elem.type).type : ''"
        :disableDrag="false"
        :parentScreenKey="screen.model.model.key"
        :elem="elem"
        :key="elem.model.key"
        @emitChildScreen="setChildScreen"
      />
    </draggable>
  </div>
</template>

<script>
  import ContainerScreen from "@/components/mobile-apps/mobile-designer/screens/ContainerScreen";
  import masBreadcrumbslist from "@/components/mobile-apps/mobile-designer/screens/mas-map";
  import masMap from "@/components/mobile-apps/mobile-designer/screens/mas-view";
  import masTabs from "@/components/mobile-apps/mobile-designer/screens/mas-tabs";
  import draggable from "vuedraggable";
  import masList from "@/components/mobile-apps/mobile-designer/screens/mas-list";
  import masView from "@/components/mobile-apps/mobile-designer/screens/mas-view";
  import masGrid from "@/components/mobile-apps/mobile-designer/screens/mas-grid";
  import maBottomnavelem from "@/components/mobile-apps/mobile-designer/widgets/ma-bottomnavelem";
  import maGrid from "@/components/mobile-apps/mobile-designer/widgets/ma-grid";


  export default {
    name: "mas-bottomnav",
    mixins: [ContainerScreen],
    components: {
      'mas-list': masList,
      'mas-tabs': masTabs,
      'mas-view': masView,
      'mas-grid': masGrid,
      'mas-map': masMap,
      'mas-breadcrumbslist': masBreadcrumbslist,
      'ma-bottomnavelem': maBottomnavelem,
      'ma-grid': maGrid,
      draggable,
    },
  };
</script>

<style scoped>
  .centered-message {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .screen-footer {
    display: flex;
    justify-content: space-around;
    background: #f6f6f6;
    border-top: 1px solid #e0e0e0;
  }
</style>
