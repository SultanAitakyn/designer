<template>
  <div
    @click="handleClick"
    style="max-width: 100%;"
    :style="{
      display: 'flex',
      flexDirection: flexDirections.find(x=> x.value===elem.model.direction).css,
    }"
  >
    <draggable
      v-for="i in [1, 2, 3, 4, 5]" :key="i" style="opacity: .5"
      :list="elem.model.children"
      :group="{ name: 'elements', pull: false, put: false }"
      :sort="true"
      :animation="350"
      :disabled="$store.state.globalDragDisabled || disableDrag"
      :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
      :style="{
        opacity: i === 1 ? 1 : 0.5,
        minWidth: '12px',
        minHeight: '12px',
      ...sizes,
      ...margins,
      ...paddings,
      ...borderRadiuses,
      border,
      background,
      }"
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
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import draggable from "vuedraggable";


  export default {
    name: "ma-list",

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
