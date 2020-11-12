import paper from "paper";
import store from "@/store";
import { CanvasElement } from "@/components/shared/canvas/CanvasElement";
import { RoundedRectangle } from "@/components/shared/canvas/RoundedRectangle";
import { ModelBorder } from "@/components/db-editor/model/ModelBorder";

export class ModelCanvasElement extends CanvasElement {
  constructor(model) {
    super(model, true);
  }

  destroy() {
    this.group.remove();
  }

  onMouseMove(event) {
    const target = store.getters.getRelationDragInfo.target;
    if (target && target.name === this.entity.name) {
      this.border.onMouseMove(event);
    }
  }

  onMouseDrag(event) {
    super.onMouseDrag(event);
    this.entity.top = parseInt(this.group.bounds.topLeft.y, 10);
    this.entity.left = parseInt(this.group.bounds.topLeft.x, 10);
    for (const relation in this.entity.relations) {
      if (this.entity.relations.hasOwnProperty(relation)) {
        this.entity.relations[relation].canvasElement.drawArrow();
      }
    }
  }

  initCanvasElements() {
    super.initCanvasElements();
    this.maxWidthElement = {
      width: 150
    };
    const title = this.createModelTitle();
    const newField = this.createAddNewFieldButton();
    const border = this.createModelBorder();
    this.border = border;
    this.group.addChildren([title, newField, border.group]);
    this.group.onClick = event => {
      if (event.event.button === 2) {
        event.stopPropagation();
        store.commit("setMenuPosition", event.point);
        store.commit("setCurrentEntity", this.entity);
      }
    };
    this.newField = newField;
  }

  createModelTitle() {
    const titleContent = new paper.PointText({
      name: "content",
      content: this.entity.module_model_id!==undefined ? 'mod: '+this.entity.name : this.entity.name,
      strokeWidth: 0.3, //font stroke width to simulate required level of bold effect
      strokeColor: "#555", //font external stroke, model title
      fillColor: "#555" //Font color, model title
    });

    const titleContainer = new RoundedRectangle({
      name: "container",
      point: [this.entity.left, this.entity.top],
      size: [this.maxWidthElement.width, 22],
      fillColor: this.entity.module_model_id!==undefined ? "#fef0dd" :"#daeffa", //model title container fill color
      strokeColor: this.entity.module_model_id!==undefined ? "#fccd8e" : '#a8daf2', //model title line color
      strokeWidth: 1.5, //model title line width
      corners: [
        [5, 5],
        [5, 5]
      ]
    });
    this.titleContainer = titleContainer;

    const title = new paper.Group({
      name: "title",
      children: [titleContainer.path, titleContent]
    });
    if (titleContent.bounds.width + 16 > this.maxWidthElement.width) {
      this.maxWidthElement.width = titleContent.bounds.width + 16;
      titleContainer.path.bounds.width = this.maxWidthElement.width;
      this.maxWidthElement.element = title;
    }
    titleContent.position = titleContainer.path.position;
    titleContent.position.x = titleContainer.path.bounds.left + titleContent.bounds.width / 2 + 9;
    //if (this.entity.module_model_id===undefined)
    title.onClick = event => {
      if (!store.getters.getDrag) {
        if (event.event.button === 0) {
          store.commit("setCurrentEntity", this.entity);
        }
      }
    };
    return title;
  }

  createAddNewFieldButton() {
    const addNewFieldButtonContent = new paper.PointText({
      name: "content",
      content: "+",
      strokeWidth: this.entity.module_model_id!==undefined ? 0 : 0.5,
      strokeColor: "#4287f5",
      fillColor: "#4287f5"
    });

    const addNewFieldButtonContainer = new RoundedRectangle({
      name: "container",
      point: [this.entity.left, this.entity.top + 22],
      size: [this.maxWidthElement.width, 22],
      fillColor: this.entity.module_model_id!==undefined ? "#fef0dd" : "#daeffa", //bottom add_field fill color
      strokeColor: this.entity.module_model_id!==undefined ? "#fccd8e" : '#a8daf2', //bottom add_field line color
      strokeWidth: 1.5, //bottom add_field line width
      corners: [null, null, [5, 5], [5, 5]]
    });

    this.addNewFieldButtonContainer = addNewFieldButtonContainer;
    addNewFieldButtonContent.position =
      addNewFieldButtonContainer.path.position;
    const addNewFieldButton = new paper.Group({
      name: "addNewFieldButton",
      children: [addNewFieldButtonContainer.path, addNewFieldButtonContent]
    });
    addNewFieldButton.onMouseEnter = () => {
      if (this.entity.module_model_id===undefined)
        addNewFieldButtonContainer.path.fillColor = "#c4ebff";
      //addNewFieldButtonContent.strokeColor = "#fff";
      addNewFieldButtonContent.content = "+ Add field";
      addNewFieldButtonContent.position = addNewFieldButtonContainer.path.position;
      addNewFieldButtonContent.strokeWidth = 0;
      //addNewFieldButtonContent.fillColor = "#fff";
    };
    addNewFieldButton.onMouseLeave = () => {
      addNewFieldButtonContainer.path.fillColor = this.entity.module_model_id!==undefined ? "#fef0dd" : "#DAEFFA";
      if (this.entity.module_model_id===undefined){
      addNewFieldButtonContent.strokeColor = "#4287f5";
      addNewFieldButtonContent.fillColor = "#4287f5";
      }
      addNewFieldButtonContent.content = "+";
      addNewFieldButtonContent.strokeWidth = 1;
      addNewFieldButtonContent.position = addNewFieldButtonContainer.path.position;
    };
    //LMB click handler for add field
    //if (this.entity.module_model_id===undefined)
    addNewFieldButton.onClick = event => {
      if (event.event.button === 0 && !store.getters.getDrag) {
        event.stopPropagation();
        store.commit("setCurrentEntity", {
          model: this.entity,
          point: addNewFieldButton.bounds.rightCenter
        });
      }
    };
    return addNewFieldButton;
  }

  createModelBorder() {
    const border = new RoundedRectangle({
      name: "border",
      point: [this.entity.left, this.entity.top],
      size: [this.maxWidthElement.width, 44],
      strokeColor: this.entity.module_model_id!==undefined ? "#fccd8e" :"#a8daf2",
      strokeWidth: 2,
      corners: [
        [5, 5],
        [5, 5],
        [5, 5],
        [5, 5]
      ]
    });
    return new ModelBorder(this.entity, border, this.entity.color);
  }

  // TODO: merge logic from this with changing field title into one function (width calculation)
  addField(field) {
    if (
      field.canvasElement.group.children["content"].bounds.width + field.canvasElement.group.children["contentType"].bounds.width + 16 >
      this.maxWidthElement.width
    ) {
      this.maxWidthElement.width =
        field.canvasElement.group.children["content"].bounds.width + field.canvasElement.group.children["contentType"].bounds.width + 16;
      this.maxWidthElement.element = field.canvasElement.group;
      this.redraw();
    } else {
      field.canvasElement.group.children[
        "container"
        ].bounds.width = this.maxWidthElement.width;
    }
      field.canvasElement.group.children["content"].position = field.canvasElement.group.children["container"].position;
      field.canvasElement.group.children["content"].position.x = field.canvasElement.group.children["content"].bounds.width/2 + 9;
      field.canvasElement.group.children["contentType"].position.x = field.canvasElement.group.children["container"].bounds.width - 5 - field.canvasElement.group.children["contentType"].bounds.width/2;

    field.canvasElement.group.position = this.newField.position;
    this.newField.position.y += 22;
    this.group.insertChild(
      this.group.children.length - 1,
      field.canvasElement.group
    );
    this.border.changeSize([
      this.maxWidthElement.width,
      this.border.border.path.bounds.height + 22
    ]);
  }

  removeField(field) {
    // first three are border for new relations, title and add new field button
    for (let i = 2; i < this.group.children.length - 1; ++i) {
      if (this.group.children[i].id === field.canvasElement.group.id) {
        this.newField.position.y -= 22;
        for (let j = i + 1; j < this.group.children.length - 1; ++j) {
          this.group.children[j].position.y -= 22;
        }
        field.canvasElement.group.remove();
        break;
      }
    }
    this.border.changeSize([
      this.maxWidthElement.width,
      this.border.border.path.bounds.height - 22
    ]);
    const relations = this.entity.relations;
    for (const relation in relations) {
      if (relations.hasOwnProperty(relation)) {
        const currentRelations = [relations[relation].sourceFieldName, relations[relation].targetFieldName];
        if (currentRelations.includes(field.name)) continue; // don't draw arrow on removed field
        this.entity.relations[relation].canvasElement.drawArrow();
      }
    }
  }

  changeTitle() {
    const titleText = this.group.children["title"].children["content"];
    titleText.content = this.entity.module_model_id!==undefined ? 'mod: '+this.entity.name : this.entity.name;
    if (titleText.bounds.width + 16 > this.maxWidthElement.width) {
      this.maxWidthElement.width = titleText.bounds.width + 16;
      this.redraw();
    } else if (
      this.maxWidthElement.element === this.group.children["title"] &&
      titleText.bounds.width + 16 < this.maxWidthElement.width
    ) {
      this.findMaxWidthElement();
      this.redraw();
    } else {
      titleText.position = this.group.children["title"].children["container"].position;
      titleText.position.x = this.group.children["title"].children["container"].bounds.left + titleText.bounds.width /2 +9;
    }
    //titleText.strokeColor = this.entity.color;
  }

  changeColor() {
    // this.group.strokeColor = this.entity.color;
    // this.group.children["title"].children[
    //   "content"
    // ].fillColor = this.entity.color;
    // for (const field in this.entity.fields) {
    //   if (this.entity.fields.hasOwnProperty(field)) {
    //     this.entity.fields[field].canvasElement.group.children[
    //       "content"
    //     ].fillColor = this.entity.color;
    //   }
    // }
    // this.group.children["addNewFieldButton"].children["content"].strokeColor =
    //   "#4287f5";
    // this.group.children["addNewFieldButton"].children["content"].fillColor =
    //   "#4287f5";
    // for (const relation in this.entity.relations) {
    //   if (this.entity.relations.hasOwnProperty(relation)) {
    //     this.entity.relations[relation].canvasElement.applyColors();
    //   }
    // }
    // this.border.color = this.entity.color;
  }

  findMaxWidthElement() {
    this.maxWidthElement = {
      width: 150
    };
    if (
      this.group.children["title"].children["content"].bounds.width + 16 >
      this.maxWidthElement.width
    ) {
      this.maxWidthElement.width =
        this.group.children["title"].children["content"].bounds.width + 16;
      this.maxWidthElement.element = this.group.children["title"];
    }
    for (let i = 2; i < this.group.children.length - 1; ++i) {
      if (
        this.group.children[i].children["content"].bounds.width + 16 >
        this.maxWidthElement.width
      ) {
        this.maxWidthElement.width =
          this.group.children[i].children["content"].bounds.width + 16;
        this.maxWidthElement.element = this.group.children[i];
      }
    }
  }

  redraw() {
    this.titleContainer.changeSize([this.maxWidthElement.width, 22]);
    this.group.children["title"].children["content"].position = this.group.children["title"].children["container"].position;
    this.group.children["title"].children["content"].position.x = this.group.children["title"].children["container"].bounds.left + this.group.children["title"].children["content"].bounds.width /2 +9;
    //titleContent.position.x = titleContainer.path.bounds.left + titleContent.bounds.width / 2 + 9;
    this.addNewFieldButtonContainer.changeSize([
      this.maxWidthElement.width,
      22
    ]);
    this.group.children["addNewFieldButton"].children[
      "content"
    ].position = this.group.children["addNewFieldButton"].children[
      "container"
    ].position;
    for (let i = 2; i < this.group.children.length - 1; ++i) {
      this.group.children[i].children["container"].bounds.width = this.maxWidthElement.width;
      this.group.children[i].children["content"].position = this.group.children[i].children["container"].position;
      this.group.children[i].children["contentType"].position = this.group.children[i].children["container"].position;
      //change x axis for field title to align left
      this.group.children[i].children["content"].position.x = this.group.children[i].children["container"].bounds.left + this.group.children[i].children["content"].bounds.width / 2 + 9;
      this.group.children[i].children["contentType"].position.x = this.group.children[i].children["container"].bounds.right - this.group.children[i].children["contentType"].bounds.width / 2 - 5;
    }
    for (const relation in this.entity.relations) {
      if (this.entity.relations.hasOwnProperty(relation)) {
        this.entity.relations[relation].canvasElement.drawArrow();
      }
    }
    this.border.changeSize([
      this.maxWidthElement.width,
      this.border.border.path.bounds.height
    ]);
  }
}
