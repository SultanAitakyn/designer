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

    <!-- Grid -->
    <div
      class="mobile-scrollbar"
      style="overflow-y: auto"
      :style="{
        margin: `-${screen.model.model.config.row_spacing / 2}px 0`,
        paddingTop: screen.model.model.config.padding[0]+'px',
        paddingRight: screen.model.model.config.padding[1]+'px',
        paddingBottom: screen.model.model.config.padding[2]+'px',
        paddingLeft: screen.model.model.config.padding[3]+'px',
      }"
    >
      <!-- Row -->
      <div
        v-for="rowIndex in 3"
        :key="rowIndex"
        style="display: flex;"
        :style="{margin: `0 -${screen.model.model.config.col_spacing / 2}px`}"
      >
        <!-- Col -->
        <div
          v-for="colIndex in screen.model.model.config.width"
          :key="colIndex"
          style="flex-grow: 1"
          :style="{
            height: (((360 - ((screen.model.model.config.padding[1] + screen.model.model.config.padding[3]) + (screen.model.model.config.col_spacing * (screen.model.model.config.width - 1)))) / screen.model.model.config.width) * screen.model.model.config.height_ratio) + 'px',
            padding: `${screen.model.model.config.row_spacing / 2}px ${screen.model.model.config.col_spacing / 2}px`
          }"
        >
          <!-- Root Stack -->
          <component
            ref="col"
            v-for="elem in screen.model.model.children"
            :key="elem.model.key"
            :is="widgetTypes.find(x=> x.enum_id===elem.type) ? widgetTypes.find(x=> x.enum_id===elem.type).type : ''"
            :elem="elem"
            :parentScreenKey="screen.model.model.key"
            :isRootStack="true"
            :disableDrag="colIndex !== 1 || rowIndex !== 1"
            :style="{
              opacity: colIndex === 1 && rowIndex === 1 ? 1 : 0.5
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import BaseScreen from "@/components/mobile-apps/mobile-designer/screens/BaseScreen";
  import ScreenHeader from "@/components/mobile-apps/mobile-designer/screens/ScreenHeader";
  import maStack from "@/components/mobile-apps/mobile-designer/widgets/ma-stack";
  import * as common from '@/utils/common';


  export default {
    name: "mas-grid",
    mixins: [BaseScreen],
    components: {
      ScreenHeader,
      'ma-stack': maStack,
    },
    created() {
      if (!this.screen.model.model.header.model) {
        this.screen.model.model.header = {
          type: 2,
          model: {
            name: "root-stack",
            key: common.makeUuid(),
            direction: 0,
            width: {size: -1, unit:1},
            height: {size: -1, unit:1},
            border:{
              radius: [
                {size: 0, unit: 0},
                {size: 0, unit: 0},
                {size: 0, unit: 0},
                {size: 0, unit: 0}
              ],
              color: {
                hex: "#c9c4c4",
                name: ''
              },
              width: 1,
            },
            background:{
              color: {
                hex: "#ffffff",
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
