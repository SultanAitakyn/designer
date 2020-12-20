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
      </div>
    </div>
  </div>
</template>

<script>
import uuidv4 from "uuid/v4";
import draggable from "vuedraggable";
import { ElementsDrawParams } from "@/components/bp-editor/block/blocks/ElementsParams";
import { BlockType } from "@/components/bp-editor/block/Block";

export default {
  name: "Loop",
  props: { block: Object, isFromPanel: Boolean, links: Array },
  components: {
    // draggable
  },
  computed: {
    itemClass() {
      return this.isFromPanel ? "rect panel" : "rect";
    },
    loopHeight() {
      return this.block.height;
    },
    loopWidth() {
      return this.calculateLoopWidth(this.block);
    },
    blockCoordinates() {
      return this.block
        ? {
            left: this.block.x + "px",
            top: this.block.y + "px",
            position: "absolute",
            width: this.loopWidth + "px",
            height: this.loopHeight + "px",
          }
        : null;
    },
    getLinks() {
      return this.links;
    },
    schema: {
      get() {
        return this.$store.getters.getSchema;
      },
      set(newSchema) {
        this.$store.commit("setSchema", newSchema);
      }
    }
  },
  methods: {
    onEditBlock() {
      this.$emit("onEditBlock", this.block);
    },
    getLoopEnd(loopStart) {
      let block = loopStart;
      let loopStartCount = 1;
      let loopEndCount = 0;
      for (let i = 0; i < this.getLinks.length; i++) {
        if (block.id === this.getLinks[i].from.id) {
          if (this.getLinks[i].to.type !== BlockType.CYCLE_END) {
            if (this.getLinks[i].to.type === BlockType.CYCLE) {
              loopStartCount++;
            }
            block = this.getLinks[i].to;
            i = -1;
          } else {
            loopEndCount++;
            if (loopEndCount < loopStartCount) {
              block = this.getLinks[i].to;
              i = -1;
            } else {
              return { block: this.getLinks[i].to, loopEndCount };
            }
          }
        }
      }
    },
    calculateLoopWidth(block) {
      for (let i = 0; i < this.getLinks.length; i++) {
        if (block.id === this.getLinks[i].from.id) {
          if (this.getLinks[i].to.type === BlockType.CYCLE_END) {
            return this.getLinks[i].to.x - this.block.x;
          }
          if (this.getLinks[i].to.type === BlockType.CYCLE) {
            block = this.getLoopEnd(this.getLinks[i].to).block;
          } else {
            block = this.getLinks[i].to;
          }
          i = -1;
        }
      }
    }
  }
};
</script>

<style scoped>
.rect {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  border: 2px solid #82caed;
  width: 260px;
  height: 200px;
  background-color: #fafdfe;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  border-radius: 10px;
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
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
}
.block-name {
  position: absolute;
  left: 60px;
  font-size: 14px;
  font-weight: 600;
}
</style>
