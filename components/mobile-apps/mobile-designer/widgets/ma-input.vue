<template>
  <a-input
    :type="VALUE_TYPES[elem.model.value_type]"
    @click.stop="handleClick"
    :placeholder="elem.model.placeholder"
    @blur="$emit('onblur')"
    :value="elem.model.value"
    autoComplete="new-password"
    :maxLength="elem.model.max_length || undefined"
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
  />
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-input",

    mixins: [BaseWidget],

    data() {
      return {
        VALUE_TYPES: ['string', 'number', 'number', 'email', 'tel', 'password']
      }
    },
  };
</script>
