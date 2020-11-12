<template>
  <div>
    <div
      style="display: flex; flex-direction: column; align-items: center"
    >
      <div
        @click="onEditBlock"
        type="primary"
        shape="rect"
        :class="itemClass"
        :style="itemClass === 'rect' && blockCoordinates"
      >
        <span class="block-name">{{ data.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import uuidv4 from "uuid/v4";
export default {
  name: "ChangeVariable",
  props: { block: Object, isFromPanel: Boolean },
  components: {
    //draggable
  },
  computed: {
    data() {
      return this.block;
    },
    itemClass() {
      return this.isFromPanel ? "rect panel" : "rect";
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
.rect {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 2px solid #47f533;
  width: 120px;
  height: 60px;
  background-color: #a4fc9a;
  -moz-border-radius: 5%;
  -webkit-border-radius: 5%;
  border-radius: 5%;
  cursor: pointer;
}
.rect:hover {
  -webkit-box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.07);
  box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.07);
}
.block-name {
  font-size: 12px;
  font-weight: 600;
  padding: 0 10px 0 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100px;
}
.panel {
  width: 75px;
  height: 35px;
  cursor: grab;
}
</style>
