<template>
  <div
    @click.stop="handleClick"
    :class="(selectedElem===elem && !disableDrag) ? 'selected' : ''"
    :style="{...margins}"
  >
    <a-switch v-model="checked" :style="{background: checked ? background : ''}"/>
  </div>
</template>

<script>
  import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";


  export default {
    name: "ma-switch",
    mixins: [BaseWidget],
    data () {
      return {
        checked: true
      }
    }
  };
</script>
