<template>
  <div
    v-if="screen"
    style="display: grid"
    :style="{background, gridTemplateRows: !hideHeader ? 'auto auto 1fr' : 'auto 1fr'}"
  >
    <ScreenHeader v-if="!hideHeader" :screen="screen"/>

    <draggable
      class="tab"
      :list="screen.model.model.children"
      :group="{ name: 'elements', pull: true, put: true }"
      :sort="true"
      :animation="350"
      :disabled="$store.state.globalDragDisabled"
      :style="{
        backgroundColor: app.colors.primary,
        color: app.colors.primary_text
      }"
    >
      <component
        v-for="elem in screen.model.model.children"
        :is="widgetTypes.find(x=> x.enum_id===elem.type) ? widgetTypes.find(x=> x.enum_id===elem.type).type : ''"
        :disableDrag="false"
        :parentScreenKey="screen.model.model.key"
        :elem="elem"
        :key="elem.model.key"
        @emitChildScreen="setChildScreen"
      />
    </draggable>

    <div class="mobile-scrollbar" style="overflow-y: auto" :class="{'centered-message': !childScreen}">
      <component
        v-if="childScreen && childScreen.model"
        :hideHeader="true"
        :key="childScreen.model.model.key"
        :is="screenTypes.find(x=> x.enum_id===childScreen.model.type) ? screenTypes.find(x=> x.enum_id===childScreen.model.type).type : ''"
        :screen="childScreen"
      />
      <p v-if="!childScreen">
        <b>No screen designated for this tab</b><br> Select target screen in tab settings
      </p>
    </div>
  </div>
</template>

<script>
  import ContainerScreen from "@/components/mobile-apps/mobile-designer/screens/ContainerScreen";
  import ScreenHeader from "@/components/mobile-apps/mobile-designer/screens/ScreenHeader";
  import draggable from "vuedraggable";
  import masList from "@/components/mobile-apps/mobile-designer/screens/mas-list";
  import masGrid from "@/components/mobile-apps/mobile-designer/screens/mas-grid";
  import masView from "@/components/mobile-apps/mobile-designer/screens/mas-view";
  import masBreadcrumbslist from "@/components/mobile-apps/mobile-designer/screens/mas-breadcrumbslist";
  import masMap from "@/components/mobile-apps/mobile-designer/screens/mas-map";
  import maTab from "@/components/mobile-apps/mobile-designer/widgets/ma-tab";
  import {mapState} from "vuex";

  export default {
    name: "mas-tabs",
    mixins: [ContainerScreen],
    components: {
      ScreenHeader,
      'ma-tab': maTab,
      'mas-list': masList,
      'mas-view': masView,
      'mas-grid': masGrid,
      'mas-map': masMap,
      'mas-breadcrumbslist': masBreadcrumbslist,
      draggable,
    },
    computed: {
      ...mapState('mobileDesigner', ['app'])
    },
  };
</script>

<style scoped>
  .tab {
    overflow: hidden;
    width: 100%;
    height: 36px;
    background-color: #f1f1f1;
    display: flex;
  }

  .centered-message {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>
