<template>
  <select
    :placeholder="getFieldNameById || elem.model.placeholder"
    :value="elem.model.value"
    style="width: 100%; height: 32px; border: 1px solid #d9d9d9"
    :style="{
      minWidth: '12px',
      minHeight: '12px',
      ...sizes,
      ...margins,
      ...paddings,
      border,
      ...borderRadiuses,
      background
    }"
    @click.stop="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
  >
    <option
      v-for="(value, index) in Object.values(elem.model.values || {})"
      :key="index"
      :value="value"
    >
      {{ value }}
    </option>
  </select>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";
  import {mapState} from "vuex";


  export default {
    name: "ma-select",
    components: {},
    mixins: [BaseWidget],
    computed: {
      ...mapState(['endpoints']),
      getFieldNameById() {
        return this.elem.model.data_field_id ? '$' + this.endpoints?.find(ep => ep.fields.find(f => f.id === this.elem.model.data_field_id))?.fields?.find(f => f.id === this.elem.model.data_field_id)?.name : ''
      }
    }
  };
</script>

<style scoped>

</style>
