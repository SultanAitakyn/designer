<template>
  <a-card
    :title="'Settings ' + (selectedElem ? 'for ' + widgetTypes.find(x => x.enum_id === selectedElem.type).label : '')"
    :body-style="{paddingTop: '8px'}"
  >
    <a-tabs
      v-if="selectedElem"
      :key="selectedElem.model.key"
      :animated="false"
      default-active-key="1"
      style="overflow: visible"
    >
      <a-tab-pane key="1">
        <span slot="tab">
          <a-icon type="eye"/>
          Look&Feel
        </span>

        <WidgetSettingsForm :widget="selectedElem"/>
        <!--<component
          :is="widgetTypes.find(x=> x.enum_id===elem.type).type+'-settings'"
          :key="elem.model ? elem.model.key : elem.name"
          :item="elem"
        />-->
      </a-tab-pane>

      <a-tab-pane key="2" v-if="availableTriggers.length>0">
        <span slot="tab">
          <a-icon type="tool"/>
          Triggers
        </span>

        <TriggersTable :item="selectedElem" :key="selectedElem.model.key"/>
      </a-tab-pane>
    </a-tabs>
    <div v-else style="text-align: center">Select element to edit it's settings</div>
  </a-card>
</template>

<script>
  import {widgetTypes, actionTriggers} from "@/utils/mautils";
  import WidgetSettingsForm from "@/components/mobile-apps/mobile-designer/widget-settings/WidgetSettingsForm";
  import TriggersTable from "@/components/mobile-apps/mobile-designer/TriggersTable";
  import {mapState} from "vuex";


  export default {
    name: 'WidgetSettings',
    props: {},
    components: {
      WidgetSettingsForm,
      TriggersTable,
    },
    data() {
      return {
        widgetTypes,
      }
    },
    computed: {
      ...mapState('mobileDesigner', ['selectedElem']),

      availableTriggers() {
        if (this.selectedElem)
          return actionTriggers.filter(f => widgetTypes.find(x => x.enum_id === this.selectedElem.type).triggers.includes(f.value));
        return [];
      },
    },
  }
</script>
