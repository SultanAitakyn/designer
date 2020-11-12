import paper from "paper";
import store from "@/store";
import { getTypeNameById } from "@/components/db-editor/field/Field";
import { CanvasElement } from "@/components/shared/canvas/CanvasElement";

export class FieldCanvasElement extends CanvasElement {
  constructor(field) {
    super(field, false);
  }

  onMouseEnter() {
    super.onMouseEnter();
    //fill field with custom color on enter
    if (this.entity.model.module_model_id===undefined && !this.entity.generated) {
      this.group.children[0].fillColor = "#c4ebff";
      this.group.children[1].strokeColor = "#0595db";
      this.group.children[1].fillColor = "#0595db";
    }
  }

  onMouseLeave() {
    super.onMouseLeave();
    //fill field with custom color on leave
    if (this.entity.model.module_model_id===undefined && !this.entity.generated){
    this.group.children[0].fillColor = "#DAEFFA";
    this.group.children[1].strokeColor = "#555";
    this.group.children[1].fillColor = "#555";
    }
  }


  createFieldTitle() {
    const titleContainer = new paper.Path.Rectangle({
      name: "container",
      point: [0, 0],
      size: [150, 22],
      strokeColor: this.entity.model.color,
      strokeWidth: 0,
      fillColor: this.entity.model.module_model_id!==undefined ? "#fef0dd" : "#DAEFFA" //Check if this is a module entity field
    });

    const titleContent = new paper.PointText({
      name: "content",
      content: `${this.entity.name}`,
      strokeWidth: 0,
      fontWeight: this.entity.generated ? 'Italic' : '',
      strokeColor: this.entity.model.color,
      fillColor: this.entity.generated ? "#888" : "#555",
    });

    const titleType = new paper.PointText({
      name: "contentType",
      content:
        (this.entity.type===6 && this.entity.array_field_type>0)
          ? `${getTypeNameById(this.entity.type, store.state.fieldValueTypes).toLowerCase()}[${getTypeNameById(this.entity.array_field_type, store.state.fieldValueTypes).toLowerCase()}]`
          : `${getTypeNameById(this.entity.type, store.state.fieldValueTypes).toLowerCase()}`,
      strokeWidth: 0,
      strokeColor: this.entity.model.color,
      fillColor: "#888"
    });

    titleContainer.bounds.width = Math.max(
      150,
      titleContent.bounds.width + titleType.bounds.width + 16
    );
    titleContent.position = titleContainer.position;
    titleType.position = titleContainer.position;
    return [titleContainer, titleContent, titleType];
  }

  initCanvasElements() {
    super.initCanvasElements();
    this.group.addChildren(this.createFieldTitle());
    this.group.name = this.entity.name;
    if (!this.entity.generated) {
      this.group.onClick = event => {
        if (event.event.button === 0 && !store.getters.getDrag) {
          store.commit("setCurrentEntity", this.entity);
        } else if (event.event.button === 2) {
          event.stopPropagation();
          store.commit("setMenuPosition", event.point);
          store.commit("setCurrentEntity", this.entity);
        }
      };
    }
  }

  changeTitle() {
    const titleText = this.group.children["content"];
    const titleType = this.group.children["contentType"];
    titleText.content = `${this.entity.name}`;
    titleType.content =
      (this.entity.type===6 && this.entity.array_field_type>0)
        ? `${getTypeNameById(this.entity.type, store.state.fieldValueTypes).toLowerCase()}[${getTypeNameById(this.entity.array_field_type, store.state.fieldValueTypes).toLowerCase()}]`
        : `${getTypeNameById(this.entity.type, store.state.fieldValueTypes).toLowerCase()}`;

    const maxElement = this.entity.model.canvasElement.maxWidthElement;
    if (
      titleText.bounds.width + titleType.bounds.width + 16 >
      maxElement.width
    ) {
      maxElement.width = titleText.bounds.width + titleType.bounds.width + 16;
      this.entity.model.canvasElement.redraw();
    } else if (
      maxElement.element === this.group &&
      titleText.bounds.width + titleType.bounds.width + 16 < maxElement.width
    ) {
      this.entity.model.canvasElement.findMaxWidthElement();
      this.entity.model.canvasElement.redraw();
    } else {
      titleText.position = this.group.children["container"].position;
      titleText.position.x =
        this.group.children["container"].bounds.left +
        titleText.bounds.width / 2 +
        9;
      titleType.position.x =
        this.group.children["container"].bounds.right -
        this.group.children["contentType"].bounds.width / 2 -
        5;
    }
    this.group.name = this.entity.name;
  }
}
