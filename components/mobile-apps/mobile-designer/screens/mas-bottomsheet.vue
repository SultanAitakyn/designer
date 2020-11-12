<template>
  <div
    v-if="screen"
    :style="{
    width: 'auto',
    height: '100%',
    background,
    display: 'flex',
    flexDirection: 'column'
  }"
  >
    <div style="flex-grow: 1; position: relative">
      <a-drawer
        :title="screen.model.model.navigation.title"
        placement="bottom"
        :closable="false"
        :visible="true"
        :get-container="false"
        :wrap-style="{ position: 'absolute' }"
        :body-style="{ padding: 0 }"
        height="50%"
      >
        <component
          v-if="childScreen && childScreen.model"
          :hideHeader="true"
          :key="childScreen.model.model.key"
          :is="screenTypes.find(x=> x.enum_id===childScreen.model.type) ? screenTypes.find(x=> x.enum_id===childScreen.model.type).type : ''"
          :screen="childScreen"
        />
      </a-drawer>
    </div>
  </div>
</template>

<script>
  import ContainerScreen from "@/components/mobile-apps/mobile-designer/screens/ContainerScreen";
  import masGrid from "@/components/mobile-apps/mobile-designer/screens/mas-grid";
  import masList from "@/components/mobile-apps/mobile-designer/screens/mas-list";
  import masView from "@/components/mobile-apps/mobile-designer/screens/mas-view";
  import maGrid from "@/components/mobile-apps/mobile-designer/widgets/ma-grid";


  export default {
    name: "mas-bottomsheet",
    mixins: [ContainerScreen],
    components: {
      'ma-grid': maGrid,
      'mas-list': masList,
      'mas-view': masView,
      'mas-grid': masGrid,
    },
  };
</script>

<style scoped>
  >>> .ant-drawer-wrapper-body::-webkit-scrollbar-track {
    background-color: #fff;
  }

  >>> .ant-drawer-wrapper-body::-webkit-scrollbar {
    width: 8px;
  }

  >>> .ant-drawer-wrapper-body::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, .25);
  }
</style>
