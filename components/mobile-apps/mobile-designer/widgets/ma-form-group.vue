<template>
  <draggable
    @click.stop="handleClick"
    :list="elem.model.children"
    :group="{ name: 'form', pull: false, put: false }"
    :sort="true"
    :animation="350"
    :disabled="$store.state.globalDragDisabled || disableDrag"
    :component-data="{on:{ click: handleClick}}"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    :style="{
        minWidth: '12px',
        minHeight: '12px',
        flexGrow: 1,
        alignSelf: 'stretch',
      ...margins,
      ...paddings,
      borderWidth: '1px',
      borderColor: 'rgba(0, 0, 0, .25)',
      borderStyle: 'dashed',
      }"
  >
    <component
      v-for="ch in elem.model.children"
      :key="ch.model ? ch.model.key : ch.name"
      :disableDrag="disableDrag"
      :parentScreenKey="parentScreenKey"
      :formKey="formKey"
      :elem="ch"
      :is="widgetTypes.find(x=> x.enum_id===ch.type) ? widgetTypes.find(x=> x.enum_id===ch.type).type : ''"
    />
  </draggable>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import draggable from "vuedraggable";
  import maInput from "@/components/mobile-apps/mobile-designer/widgets/ma-input";
  import maMultiline from "@/components/mobile-apps/mobile-designer/widgets/ma-multiline";
  import maFormGroup from "@/components/mobile-apps/mobile-designer/widgets/ma-form-group";
  import maGeopicker from "@/components/mobile-apps/mobile-designer/widgets/ma-geopicker";
  import maFilepicker from "@/components/mobile-apps/mobile-designer/widgets/ma-filepicker";
  import maDatepicker from "@/components/mobile-apps/mobile-designer/widgets/ma-datepicker";
  import maRangeSlider from "@/components/mobile-apps/mobile-designer/widgets/ma-range-slider";
  import maHiddenField from "@/components/mobile-apps/mobile-designer/widgets/ma-hidden-field";
  import maSwitch from "@/components/mobile-apps/mobile-designer/widgets/ma-switch";
  import maSelect from "@/components/mobile-apps/mobile-designer/widgets/ma-select";
  import maText from "@/components/mobile-apps/mobile-designer/widgets/ma-text";
  import maButton from "@/components/mobile-apps/mobile-designer/widgets/ma-button";
  import maImage from "@/components/mobile-apps/mobile-designer/widgets/ma-image";
  import maIcon from "@/components/mobile-apps/mobile-designer/widgets/ma-icon";


  export default {
    name: "ma-form-group",

    mixins: [BaseWidget],

    components: {
      draggable,
      'ma-input': maInput,
      'ma-multiline': maMultiline,
      'ma-form-group': maFormGroup,
      'ma-filepicker': maFilepicker,
      'ma-geopicker': maGeopicker,
      'ma-datepicker': maDatepicker,
      'ma-range-slider': maRangeSlider,
      'ma-hidden-field': maHiddenField,
      'ma-select': maSelect,
      'ma-switch': maSwitch,
      'ma-text': maText,
      'ma-button': maButton,
      'ma-image': maImage,
      'ma-icon': maIcon,
      maStack: () => import('@/components/mobile-apps/mobile-designer/widgets/ma-stack'),
    },
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
  }
</style>
