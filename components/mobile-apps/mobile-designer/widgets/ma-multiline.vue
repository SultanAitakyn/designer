<template>
  <a-textarea
    :type="VALUE_TYPES[elem.model.value_type]"
    @click.stop="handleClick"
    :placeholder="elem.model.placeholder"

    :maxLength="elem.model.max_length || undefined"
    @blur="$emit('onblur')"
    :rows="elem.model.lines"
    :value="elem.model.value"
    :style="{
      minWidth: '12px',
      minHeight: '12px',
      ...sizes,
      ...margins,
      ...paddings,
      ...borderRadiuses,
      border,
      background,
    }"
    style="resize: none"
  />
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-multiline",
    mixins: [BaseWidget],
    data() {
      return {
        VALUE_TYPES: ['string', 'number', 'number', 'email', 'tel', 'password']
      }
    },
  };
</script>
