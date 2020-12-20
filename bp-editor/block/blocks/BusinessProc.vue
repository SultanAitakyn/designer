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
<!--      <span v-if="itemClass === 'rect panel'" style="margin: 5px 0"-->
<!--        >Business Process</span-->
<!--      >-->
    </div>
  </div>
</template>

<script>
import uuidv4 from "uuid/v4";
import draggable from "vuedraggable";
export default {
  name: "BusinessProc",
  props: { block: Object, isFromPanel: Boolean },
  components: {
    //   draggable
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
  border: 2px solid #82caed;
  width: 120px;
  height: 60px;
  background-color: #daeffa;
  -moz-border-radius: 5%;
  -webkit-border-radius: 5%;
  border-radius: 5%;
  cursor: pointer;
}
.rect:hover {
  -webkit-box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.07);
  box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.07);
}
.panel {
  width: 75px;
  height: 35px;
  cursor: grab;
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
</style>
