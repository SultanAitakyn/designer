<template>
  <div
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    style="overflow: hidden; flex-grow: 1; align-self: stretch"
    :style="{
      ...margins,
      ...paddings,
      background,
      border: border || '1px dashed rgba(0,0,0,.25)',
      ...borderRadiuses,
    }"
  >
    <!-- Row -->
    <div
      v-for="rowIndex in 3"
      :key="rowIndex"
      style="display: flex;"
      :style="{margin: `0 -${elem.model.col_spacing / 2}px`}"
    >
      <!-- Col -->
      <div
        v-for="colIndex in elem.model.width"
        :key="colIndex"
        style="flex-grow: 1"
        :style="{
          padding: `${elem.model.row_spacing / 2}px ${elem.model.col_spacing / 2}px`,
          opacity: colIndex === 1 && rowIndex === 1 ? 1 : 0.5
        }"
      >
        <draggable
          :list="elem.model.children"
          :group="{ name: 'elements', pull: false, put: false }"
          :sort="true"
          :animation="350"
          :disabled="$store.state.globalDragDisabled || disableDrag"
        >
          <component
            v-for="ch in elem.model.children"
            :disableDrag="disableDrag"
            :parentScreenKey="parentScreenKey"
            :key="ch.model.key"
            :elem="ch"
            :is="widgetTypes.find(x=> x.enum_id===ch.type) ? widgetTypes.find(x=> x.enum_id===ch.type).type : ''"
          />
        </draggable>
      </div>
    </div>
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import draggable from "vuedraggable";


  export default {
    name: "ma-grid",
    mixins: [BaseWidget],
    components: {
      draggable,
      maStack: () => import('@/components/mobile-apps/mobile-designer/widgets/ma-stack')
    },
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
  }
</style>
