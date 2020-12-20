<template>
  <div>
    <div
      style="display: flex; flex-direction: column; align-items: center"
    >
      <div
        @click="onEditBlock"
        :class="itemClass"
        :style="itemClass === 'diamond' && blockCoordinates"
      >
        <img :src="diamond" :class="itemClass" />
        <div>
          <span class="block-name">{{ data.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import uuidv4 from "uuid/v4";
import diamond from "@/assets/img/blocks/diamond.svg";
export default {
  name: "Condition",
  props: { block: Object, isFromPanel: Boolean },
  components: {
    // diamond
  },
  data() {
    return {
      diamond: diamond
    };
  },
  computed: {
    data() {
      return this.block;
    },
    itemClass() {
      return this.isFromPanel ? "diamond panel" : "diamond";
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
.diamond {
  width: 120px;
  height: 60px;
  position: relative;
  cursor: pointer;
}
.block-name {
  position: absolute;
  text-align: center;
  left: 21px;
  top: 18px;
  width: 80px;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.panel {
  width: 75px;
  height: 35px;
  cursor: grab;
}
</style>
