<template>
  <div
    v-if="screen"
    style="display: grid"
    :style="{background, gridTemplateRows: !hideHeader ? 'auto auto 1fr' : 'auto 1fr'}"
  >
    <ScreenHeader v-if="!hideHeader" :screen="screen"/>

    <div class="screen-subheader">
      <ma-stack
        v-if="screen.model.model.header"
        :disableDrag="false"
        :isRootStack="true"
        :elemsLimit="1"
        :parentScreenKey="screen.model.model.key"
        :elem="screen.model.model.header"
      />
    </div>

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
  import * as common from '@/utils/common';

  export default {
    name: "mas-list",
    mixins: [BaseScreen],
    components: {
      ScreenHeader,
      'ma-stack': maStack,
    },
    created() {
      if (!this.screen.model.model.header || !this.screen.model.model.header.model) {
        this.screen.model.model.header = {
          type: 2,
          model: {
            name: "root-stack",
            key: common.makeUuid(),
            direction: 0,
            width: {size: -1, unit: 1},
            height: {size: -1, unit: 1},
            border: {
              radius: [
                {size: 0, unit: 0},
                {size: 0, unit: 0},
                {size: 0, unit: 0},
                {size: 0, unit: 0}
              ],
              color: {
                hex: "",
                name: ''
              },
              width: 1,
            },
            background: {
              color: {
                hex: "",
                name: ''
              },
              image: null,
            },
            color: {
              hex: "#303f9f",
              name: ''
            },
            actions: [],
            margin: [0, 0, 0, 0],
            padding: [4, 4, 4, 4],
            horizontal_align: 3,
            vertical_align: 3,
            children: [],
            font: {
              family: "system",
              size: 14,
              weight: 400,
              italic: false
            },
            stack_type: 0
          }
        }
      }
    }
  };
</script>

<style scoped>
  .screen-subheader {
    margin-bottom: 8px;
    background: #f1f1f1;
  }
</style>
