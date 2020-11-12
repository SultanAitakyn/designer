<template>
  <div>
    <draggable
      class="line-container"
      :style="linkCoordinates"
      :group="{ name: 'any', pull: false, put: true }"
    >
      <div class="line-container">
        <span class="line" :style="lineStyle"></span>
      </div>
    </draggable>

<!--    Tags for condition block-->
    <div
      :style="conditionTagPosition"
      v-if="link.from.type === BlockType.CONDITION"
    >
      <a-tag class="tag">
        <a-badge v-if="cases" style="width: 5px" color="#9a8c98" />
        <div class="tag-label">{{ getTagLabel(link.from) }}</div>
      </a-tag>
    </div>

    <!--    Lines for condition block-->
    <div
      v-if="isVerticalLineNeeded"
      class="line-container condition-start-end"
      :style="conditionStartCoordinate"
    >
      <span class="line condition-start"></span>
    </div>
    <div
      v-if="isVerticalLineNeeded"
      class="line-container condition-start-end end"
      :style="conditionEndCoordinate"
    >
      <span class="line"></span>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import { ElementsDrawParams } from "@/components/bp-editor/block/blocks/ElementsParams";
import { BlockType } from "@/components/bp-editor/block/Block";
import { Render } from "../../schema/Render";

export default {
  name: "Lines",
  props: { link: Object, enums: Array },
  components: {
    draggable
  },
  data() {
    return {
      BlockType
    };
  },
  computed: {
    linkWidth() {
      return this.link
        ? {
            width: this.link.to.x - this.link.x
          }
        : null;
    },
    linkCoordinates() {
      return this.link
        ? {
            left: this.link.x + "px",
            top: this.link.y + "px",
            position: "absolute",
            width: this.linkWidth.width + "px",
            height: "60px"
          }
        : null;
    },
    conditionStartEnd() {
      return this.link
        ? {
            top:
              this.link.y +
              ElementsDrawParams.lineHeight / 2 -
              ElementsDrawParams.lineWidth,
            width: 70
          }
        : null;
    },
    conditionStartCoordinate() {
      return this.link
        ? {
            left: this.link.x + "px",
            top: this.conditionStartEnd.top + "px",
            position: "absolute",
            height: "1px",
            width: this.link.y - this.link.from.y + "px"
          }
        : null;
    },
    conditionEndCoordinate() {
      return this.link
        ? {
            left: this.getConditionEnd.x + "px",
            top: this.conditionStartEnd.top + "px",
            position: "absolute",
            height: "1px",
            width: this.link.y - this.link.from.y + "px"
          }
        : null;
    },
    lineStyle() {
      let style = null;
      if (
        this.link.from.type === BlockType.CYCLE ||
        (this.link.to.type === BlockType.CYCLE_END &&
          !this.isConnectedToConditionEnd)
      ) {
        style = { height: "0px", "--content": "0px" };
      } else if (!this.isLinkVisible) {
        style = { "--content": "0px" };
      }
      return style;
    },
    conditionTagPosition() {
      return this.link
        ? {
            position: "absolute",
            left: this.link.x + 10 + "px",
            top: this.link.y + "px"
          }
        : null;
    },
    schema: {
      get() {
        return this.$store.getters.getSchema;
      }
    },
    render() {
      return new Render(this.schema.data.nodes, this.schema.data.edges);
    },
    cases() {
      return !this.link.from.second && this.link.from.first
        ? this.schema.data.edges
            .filter(v => v.from.id === this.link.from.id)
            .map(v => {
              return { case: v, isVisited: false };
            })
        : null;
    },
    isLinkVisible() {
      return this.getConditionEnd ? this.manageLinkPointerVisibility() : true;
    },
    isConnectedToConditionEnd() {
      return this.schema.data.edges.filter(v => v.to.id === this.link.to.id).length > 1;
    },
    getConditionEnd() {
      return this.link.from.type === BlockType.CONDITION ? this.render.findConditionEnd(this.link.from) : null;
    },
    isVerticalLineNeeded() {
      return this.link.from.type === BlockType.CONDITION &&
        !this.link.from.second &&
        this.link.from.first
        ? true
        : this.link.from.type === BlockType.CONDITION &&
          !this.link.from.second &&
          !this.link.from.first &&
          this.link.value === true
        ? true
        : this.link.from.type === BlockType.CONDITION &&
          this.link.from.second &&
          this.link.from.first &&
          this.link.value === true
        ? true
        : false;
    }
  },
  methods: {
    manageLinkPointerVisibility() {
      const allBranches = this.schema.data.edges.filter(
        v => v.from.id === this.link.from.id
      );
      allBranches.sort((a, b) => parseFloat(a.y) - parseFloat(b.y));
      return !(this.link.id !== allBranches[0].id && this.link.to.id === this.getConditionEnd.id);
    },
    getTagLabel(block) {
      if (block.condition_type === 7) {
        if (block.fields[0].array_value_type === 7) {
          const en = this.link.value.split(",").map(v => Number(v));
          const firstVariableEnum = this.enums.find(v => v.id === block.fields[0].enum_id);
          const enum_values = firstVariableEnum ? firstVariableEnum.values : null;
          return en.map(
            v => enum_values.find(d => d.value === v).label
          );
        } else if (block.fields[0].value_type === 7) {
          const firstVariableEnum = this.enums.find(v => v.id === block.fields[0].enum_id);
          const enum_values = firstVariableEnum ? firstVariableEnum.values : null;
          return enum_values.find(
            v => v.value === Number(this.link.value)
          ).label;
        }
      }
      return this.link.value;
    }
  }
};
</script>
<style scoped>
.line-container {
  width: 100%;
  display: flex;
  align-items: center;
  position: absolute;
  height: 60px;
  justify-content: center;
}
.condition-start-end {
  -moz-transform: rotate(-90deg);
  -o-transform: rotate(-90deg);
  -ms-transform: rotate(-90deg);
  transform: translate(0, 60px) rotate(-90deg);
  transform-origin: left top;
  -webkit-transform: translate(0, 70px) rotate(-90deg);
  -webkit-transform-origin: left top;
  --content: 0px;
}
.line {
  flex-grow: 1;
  height: 1px;
  background: #555555;
  position: relative;
  --content: "";
  cursor: pointer;
}
.condition-start {
  --content: 0px;
}
.line:after {
  position: absolute;
  content: var(--content);
  bottom: -6px;
  right: 0;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid #555555;
}
.line:hover {
  background: #0595db;
  height: 2px;
}
.line:hover:after {
  content: var(--content);
  bottom: -6px;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 10px solid #0595db;
}
.tag {
  border: 1px #e5e5e5 solid;
  width: 45px;
  display: flex;
  justify-content: space-around;
}
.tag-label {
  color: #555555;
  overflow: hidden;
  white-space: nowrap;
}
</style>
