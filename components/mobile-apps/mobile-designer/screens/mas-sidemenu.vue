<template>
  <div
    v-if="screen"
    style="display: grid"
    :style="{gridTemplateRows: !hideHeader ? '1fr' : '1fr'}"
  >
    <div style="background: rgba(0, 0, 0, 0.45); overflow: hidden">
      <a-menu
        class="mobile-scrollbar"
        style="width: 256px; height: 100%; border-right: none; overflow-y: auto; overflow-x: hidden; padding-top: 100px;"
        :default-selected-keys="['1']"
        mode="inline"
        :style="{background}"
      >
        <a-menu-item
          v-for="menu in screen.model.model.actions"
          :key="menu.key"
        >
          <a-icon :type="menu.icon.name" :style="{color: color(menu.icon.color)}"/>
          {{menu.label}}
        </a-menu-item>
      </a-menu>
    </div>
  </div>
</template>

<script>
  import BaseScreen from "@/components/mobile-apps/mobile-designer/screens/BaseScreen";
  import {mapState} from "vuex";

  export default {
    name: "mas-sidemenu",
    mixins: [BaseScreen],
    computed: {
      ...mapState('mobileDesigner', ['childScreen'])
    },
    data() {
      return {
        current: ['mail'],
      }
    },
  };
</script>

<style scoped>
  >>> .ant-menu-submenu > .ant-menu {
    background: rgba(255,255,255,.2) !important;
  }
</style>
