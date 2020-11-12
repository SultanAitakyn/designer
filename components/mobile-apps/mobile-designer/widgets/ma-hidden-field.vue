<template>
  <div @click="handleClick" :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''">
    <a-input
      disabled
      placeholder="Hidden field"
      size="small"
      @blur="$emit('onblur')"
    />
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-hidden-field",
    mixins: [BaseWidget],
    data() {
      return {
        VALUE_TYPES: ['string', 'number', 'number', 'email', 'tel', 'password']
      }
    },
  };
</script>
