import paper from "paper";
import store from "@/store";

export class CanvasElement {
  constructor(entity, draggable = false) {
    this.entity = entity;
    this.draggable = draggable;
    this.initCanvasElements();
  }

  onMouseDown() {
    store.commit("setDrag", false);
  }

  onMouseDrag(event) {
    event.stopPropagation();
    store.commit("setCurrentEntity", null);
    this.group.bringToFront();
    this.group.position.x =
      this.group.bounds.topLeft.x + event.delta.x > 0
        ? this.group.position.x + event.delta.x
        : this.group.position.x;
    this.group.position.y =
      this.group.bounds.topLeft.y + event.delta.y > 0
        ? this.group.position.y + event.delta.y
        : this.group.position.y;
    store.commit("setDrag", true);
  }

  onMouseUp() {
    if (store.getters.getDrag && store.getters.getSchema) {
      store.getters.getSchema.saveLocally();
    }
  }

  onMouseEnter() {
    document.getElementById("editor-canvas").style.cursor = "pointer";
  }

  onMouseLeave() {
    document.getElementById("editor-canvas").style.cursor = "";
  }

  initCanvasElements() {
    this.group = new paper.Group([]);
    this.group.onMouseEnter = this.onMouseEnter.bind(this);
    this.group.onMouseLeave = this.onMouseLeave.bind(this);
    if (this.draggable) {
      this.group.onMouseDown = this.onMouseDown.bind(this);
      this.group.onMouseDrag = this.onMouseDrag.bind(this);
      this.group.onMouseUp = this.onMouseUp.bind(this);
    }
  }

  destroy() {
    this.group.remove();
  }
}
