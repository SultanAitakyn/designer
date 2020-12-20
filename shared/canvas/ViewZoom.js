import paper from "paper";
import store from "@/store";

export class ViewZoom {
  constructor(project) {
    this.factor = 1.25;
    this.project = project;

    const view = this.project.view;

    view.element.addEventListener("wheel", event => {
      if (event.ctrlKey || event.altKey) {
        event.preventDefault();
        store.commit("setCurrentEntity", null);
        store.commit("setMenuPosition", null);
        const mousePosition = new paper.Point(event.offsetX, event.offsetY);
        this.changeZoomCentered(event.deltaY, mousePosition);
      }
    });

    view.on("mousedown", event => {
      event.stopPropagation();
      store.commit("setCurrentEntity", null);
      store.commit("setMenuPosition", null);
      this.viewCenterStart = view.center;
      // Have to use native mouse offset, because ev.delta
      //  changes as the view is scrolled.
      this.mouseNativeStart = new paper.Point(
        event.event.offsetX,
        event.event.offsetY
      );
    });

    view.on("mousedrag", event => {
      if (this.viewCenterStart) {
        const nativeDelta = new paper.Point(
          event.event.offsetX - this.mouseNativeStart.x,
          event.event.offsetY - this.mouseNativeStart.y
        );
        // Move into view coordinates to subract delta,
        //  then back into project coords.
        view.center = view.viewToProject(
          view.projectToView(this.viewCenterStart).subtract(nativeDelta)
        );
      }
    });

    view.on("mouseup", () => {
      if (this.mouseNativeStart) {
        this.mouseNativeStart = null;
        this.viewCenterStart = null;
      }
    });
  }

  get zoom() {
    return this.project.view.zoom;
  }

  /**
   * Set zoom level.
   * @returns zoom level that was set, or null if it was not changed
   */
  setZoomConstrained(zoom) {
    if (this._minZoom) {
      zoom = Math.max(zoom, this._minZoom);
    }
    if (this._maxZoom) {
      zoom = Math.min(zoom, this._maxZoom);
    }
    const view = this.project.view;
    if (zoom !== view.zoom) {
      view.zoom = zoom;
      return zoom;
    }
    return null;
  }

  changeZoomCentered(delta, mousePos) {
    if (!delta) {
      return;
    }
    const view = this.project.view;
    const oldZoom = view.zoom;
    const oldCenter = view.center;
    const viewPos = view.viewToProject(mousePos);

    let newZoom = delta > 0 ? view.zoom / this.factor : view.zoom * this.factor;
    newZoom = this.setZoomConstrained(newZoom);

    if (!newZoom) {
      return;
    }

    const zoomScale = oldZoom / newZoom;
    const centerAdjust = viewPos.subtract(oldCenter);
    const offset = viewPos
      .subtract(centerAdjust.multiply(zoomScale))
      .subtract(oldCenter);

    view.center = view.center.add(offset);
  }
}
