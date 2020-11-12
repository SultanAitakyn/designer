<template>
  <span
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    :style="{
      minWidth: '12px',
      minHeight: '12px',
      ...sizes,
      ...margins,
      ...paddings,
      ...borderRadiuses,
      ...font,
      color: color(elem.model.color),
      border,
      lineClamp: elem.model.max_lines
    }"
    style="display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.25"
  >
    {{getFieldNameById}}
  </span>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import {mapState} from "vuex";


  export default {
    name: "ma-text",
    mixins: [BaseWidget],
    computed: {
      ...mapState(['endpoints']),
      getFieldNameById() {
        if (this.elem.model.data_field_id) {
          return '$' + this.endpoints?.find(ep => ep.fields.find(f => f.id === this.elem.model.data_field_id))?.fields?.find(f => f.id === this.elem.model.data_field_id)?.name
        } else return this.elem.model.title
      }
    },
  };
</script>
