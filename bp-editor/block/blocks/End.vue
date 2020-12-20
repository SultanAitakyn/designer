<template>
  <div>
    <div :style="blockCoordinates">
      <div type="primary" class="end" @click="onEditBlock"></div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "end",
  props: { block: Object },
  components: {
    //draggable
  },
  computed: {
    data() {
      return this.block;
    },
    blockCoordinates() {
      return this.block
        ? {
            left: this.block.x + "px",
            top: this.block.y + "px",
            position: "absolute"
          }
        : null;
    }
  },
  methods: {
    onEditBlock() {
      this.$emit("onEditBlock", this.data);
    }
  }
};
</script>
<style scoped>
.wrapper {
  position: absolute;
  left: 152px;
  top: 284px;
}
.end {
  background-color: #faaba9;
  border: 1px solid #f55d5a;
  height: 25px;
  width: 25px;
  border-radius: 50%;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  cursor: pointer;
}
</style>
