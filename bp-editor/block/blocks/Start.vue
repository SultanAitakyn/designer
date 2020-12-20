<template>
  <div>
    <div :style="blockCoordinates">
      <div
        @click="onEditBlock"
        type="primary"
        class="start"
      ></div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "start",
  props: { block: Object },
  components: {
  //  draggable
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
    },
    rightDragZoneCoordinates() {
      return this.block
        ? {
            left: this.block.x + 32 + "px",
            top: this.block.y - 8 + "px",
            position: "absolute",
            width: "80px",
            height: "50px"
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
.start {
  background-color: #bbe581;
  border:1px solid #76ca02;
  height:25px;
  width: 25px;
  border-radius:50%;
  -moz-border-radius:50%;
  -webkit-border-radius:50%;
  cursor: pointer;
}
</style>
