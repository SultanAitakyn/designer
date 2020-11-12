<template>
  <span
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    style="align-self: stretch; width: 100%"
  >
    <a-collapse>
      <a-collapse-panel :key="elem.model.key" @click.prevent>
        <div slot="header">
          <draggable
            :list="bodyComp"
            :group="{ name: 'elements', pull: true, put: (to, from, el) => el.dataset.elemType !== 'ma-breadcrumbs' }"
            :sort="true"
            :animation="350"
            @add="handleDropOnBody"
            style="min-height: 24px"
            :disabled="$store.state.globalDragDisabled || disableDrag"
            :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
          >
            <component
              v-for="ch in bodyComp"
              :disableDrag="disableDrag"
              :parentScreenKey="parentScreenKey"
              :key="ch.model.key"
              :elem="ch"
              :is="widgetTypes.find(x=> x.enum_id===ch.type) ? widgetTypes.find(x=> x.enum_id===ch.type).type : ''" />
          </draggable>
        </div>
        <draggable
          :list="elem.model.children"
          :group="{ name: 'elements', pull: true, put: true }"
          :sort="true"
          :animation="350"
          :disabled="$store.state.globalDragDisabled || disableDrag"
          :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
        >
          <component
            v-for="ch in elem.model.children"
            :disableDrag="disableDrag"
            :parentScreenKey="parentScreenKey"
            :key="ch.model.key"
            :elem="ch"
            :is="widgetTypes.find(x=> x.enum_id===ch.type) ? widgetTypes.find(x=> x.enum_id===ch.type).type : ''" />
        </draggable>
      </a-collapse-panel>
    </a-collapse>
  </span>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import draggable from "vuedraggable";
  import maText from '@/components/mobile-apps/mobile-designer/widgets/ma-text';

  export default {
    name: "ma-accordion",
    mixins: [BaseWidget],

    components: {
      draggable,
      maStack: () => import('@/components/mobile-apps/mobile-designer/widgets/ma-stack'),
      'ma-text': maText,
    },

    computed: {
      bodyComp: {
        get() {
          return this.elem.model.body ? [this.elem.model.body] : []
        },
        set(newVal) {
          this.elem.model.body = newVal[newVal.length - 1]
        }
      }
    },

    methods: {
      handleDropOnBody(e) {
        this.elem.model.body = this.bodyComp[0]
      }
    }
  };
</script>
<style scoped>
  .drag-area {
    min-height: 150px;
    min-width: 150px;
    border: 1px dotted #555555;
  }
  .mockup-stack {
    border: 1px dashed #dadada;
    display: flex;
    flex-direction: row;
    background-color: blue;
  }
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
    /*#0000005e*/
  }
</style>
