<template>
  <div
    class="canvas-context-menu"
    :style="{
      top: position.y + 'px',
      left: position.x + 'px'
    }"
  >
    <a-menu @select="onSelect">
      <slot></slot>
    </a-menu>
  </div>
</template>

<script>
export default {
  name: "CanvasMenu",
  props: {
    position: {
      type: Object,
      required: true
    }
  },
  methods: {
    onSelect({ key }) {
      this.$emit("select", key);
    }
  }
};
</script>
