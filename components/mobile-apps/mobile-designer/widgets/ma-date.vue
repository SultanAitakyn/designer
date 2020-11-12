<template>
  <span
    @click="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    style="line-height: 1.25;"
    :style="{
      ...sizes,
      ...margins,
      ...paddings,
      color: color(elem.model.color),
      ...font,
      border,
      ...borderRadiuses,
      background,
    }"
  >
    {{ elem.model.data_field_id ? getFieldNameById : moment(elem.model.from || undefined).format(datetimeFormat.momentFormat)}}
  </span>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import {datetimeFormats} from "@/utils/mautils";
  import moment from 'moment';
  import {mapState} from "vuex";

  export default {
    name: "ma-date",
    mixins: [BaseWidget],
    data() {
      return {
        moment,
        datetimeFormats
      }
    },
    computed: {
      ...mapState(['endpoints']),

      datetimeFormat() {
        return datetimeFormats.find(dtf => dtf.value === this.elem.model.format)
      },
      getFieldNameById() {
        if (this.elem.model.data_field_id) {
          return '$' + this.endpoints?.find(ep => ep.fields.find(f => f.id === this.elem.model.data_field_id))?.fields?.find(f => f.id === this.elem.model.data_field_id)?.name
        } else return this.elem.model.title
      },
    },
  };
</script>

<style scoped>
  .selected {
    box-shadow: 0px 0px 4px 0px #00adff;
  }
</style>
