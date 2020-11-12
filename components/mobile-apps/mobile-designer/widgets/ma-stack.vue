<template>
  <draggable
    :list="elem.model.children"
    :group="{ name: 'elements', pull: true, put: formFilter }"
    :sort="true"
    :animation="350"
    :disabled="$store.state.globalDragDisabled || disableDrag || elemsLimit && elem.model.children && elem.model.children.length >= elemsLimit"
    :component-data="{on:{ click: handleClick}}"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    :style="{
      minWidth: elem.model.width && elem.model.width.size < 1 ? '16px' : !isRootStack && '16px',
      minHeight: elem.model.height && elem.model.height.size < 1 ? '16px' : !isRootStack && '16px',
      ...sizes,
      ...margins,
      ...paddings,
      ...borderRadiuses,
      display: 'flex',
      justifyContent,
      alignItems,
      flexDirection,
      border: border || '1px dashed rgba(0,0,0,.25)',
      background
    }"
    @add="addHandle"
  >
    <component
      v-for="ch in elem.model.children"
      :disableDrag="disableDrag"
      :parentScreenKey="parentScreenKey"
      :formKey="formKey"
      :key="ch.model.key"
      :elem="ch"
      :is="widgetTypes.find(x=> x.enum_id===ch.type) ? widgetTypes.find(x=> x.enum_id===ch.type).type : ''"
    />
  </draggable>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import draggable from "vuedraggable";
  import maText from "@/components/mobile-apps/mobile-designer/widgets/ma-text";
  import maDate from "@/components/mobile-apps/mobile-designer/widgets/ma-date";
  import maView from "@/components/mobile-apps/mobile-designer/widgets/ma-view";
  import maGrid from "@/components/mobile-apps/mobile-designer/widgets/ma-grid";
  import maGallery from "@/components/mobile-apps/mobile-designer/widgets/ma-gallery";
  import maList from "@/components/mobile-apps/mobile-designer/widgets/ma-list";
  import maButton from "@/components/mobile-apps/mobile-designer/widgets/ma-button";
  import maImage from "@/components/mobile-apps/mobile-designer/widgets/ma-image";
  import maIcon from "@/components/mobile-apps/mobile-designer/widgets/ma-icon";
  import maForm from "@/components/mobile-apps/mobile-designer/widgets/ma-form";
  import maMap from "@/components/mobile-apps/mobile-designer/widgets/ma-map";
  import maAccordion from "@/components/mobile-apps/mobile-designer/widgets/ma-accordion";
  import maRating from "@/components/mobile-apps/mobile-designer/widgets/ma-rating";
  import maWorkloadBar from "@/components/mobile-apps/mobile-designer/widgets/ma-workload-bar";
  import maInput from '@/components/mobile-apps/mobile-designer/widgets/ma-input';
  import maMultiline from '@/components/mobile-apps/mobile-designer/widgets/ma-multiline';
  import maFormGroup from '@/components/mobile-apps/mobile-designer/widgets/ma-form-group';
  import maFilepicker from '@/components/mobile-apps/mobile-designer/widgets/ma-filepicker';
  import maGeopicker from '@/components/mobile-apps/mobile-designer/widgets/ma-geopicker';
  import maDatepicker from '@/components/mobile-apps/mobile-designer/widgets/ma-datepicker';
  import maRangeSlider from '@/components/mobile-apps/mobile-designer/widgets/ma-range-slider';
  import maHiddenField from '@/components/mobile-apps/mobile-designer/widgets/ma-hidden-field';
  import maSelect from '@/components/mobile-apps/mobile-designer/widgets/ma-select';
  import maSwitch from '@/components/mobile-apps/mobile-designer/widgets/ma-switch';


  export default {
    name: "ma-stack",

    mixins: [BaseWidget],

    components: {
      draggable,
      'ma-text': maText,
      'ma-date': maDate,
      'ma-view': maView,
      'ma-grid': maGrid,
      'ma-gallery': maGallery,
      'ma-list': maList,
      'ma-map': maMap,
      'ma-accordion': maAccordion,
      'ma-button': maButton,
      'ma-image': maImage,
      'ma-icon': maIcon,
      'ma-form': maForm,
      'ma-rating': maRating,
      'ma-workload-bar': maWorkloadBar,
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
    },

    created() {
      if (!this.elem.model.children) {
        this.elem.model.children = []
      }
    },

    methods: {
      formFilter(to, from, el) {
        if (from.options.group.name === 'form') {
          if (this.formKey) {
            return true
          } else {

            to.el.className = 'denied-zone'
            const findFormDropZone = (children) => {
              for (const child of children) {
                if (child.formKey) {
                  child.$el.className = 'access-zone'
                } else {
                  if (child.$children) {
                    findFormDropZone(child.$children)
                  }
                }
              }
            }
            findFormDropZone(to.el.__vue__.$children)

            to.el.ondragleave = to.el.ondrop = () => {
              to.el.className = ''
              const asd = (children) => {
                for (const child of children) {
                  if (child.formKey) {
                    child.$el.className = ''
                  } else {
                    if (child.$children) {
                      asd(child.$children)
                    }
                  }
                }
              }
              asd(to.el.__vue__.$children)

              to.el.ondragleave = to.el.ondrop = null
            }

            return false
          }
        } else {
          if (el.dataset.elemType === 'ma-form') {
            return !this.formKey
          } else {
            if (['ma-breadcrumbs', 'ma-tab', 'ma-bottomnavelem'].includes(el.dataset.elemType)) {

              to.el.className = 'denied-zone'
              to.el.ondragleave = to.el.ondrop = () => {
                to.el.className = ''
                to.el.ondragleave = to.el.ondrop = null
              }

              return false
            } else return true
          }
        }
      },

      addHandle(e) {
        this.setSelectedElem(this.elem.model.children[e.newIndex])
      },
    }
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0 0 4px 0 #00adff;
  }
  .denied-zone {
    background-color: rgb(255, 180, 180);
  }
  .access-zone {
    background-color: rgb(180, 255, 180);
  }
</style>
