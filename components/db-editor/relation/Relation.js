import uuidv4 from "uuid/v4";
import { RelationCanvasElement } from "@/components/db-editor/relation/RelationCanvasElement";

export const RelationType = Object.freeze({
  HAS_ONE: 1,
  HAS_MANY: 2,
  MANY_TO_MANY: 3
});

export class Relation {
  constructor(
    id,
    schema,
    source,
    target,
    type = RelationType.HAS_ONE,
    sourceFieldName = "",
    targetFieldName = "",
    options = []
  ) {
    if (Number.isInteger(type) && type >= 1 && type <= 3) {
      this.id = id;
      this.schema = schema;
      this.type = type;
      this.sourceFieldName = sourceFieldName;
      this.targetFieldName = targetFieldName;
      this.source = source;
      this.target = target;
      this.options = options;
      this.canvasElement = new RelationCanvasElement(this);
    } else {
      throw new Error("invalid relation type");
    }
  }

  destroy() {
    this.canvasElement.destroy();
  }

  changeValues(data) {
    let newSource, newTarget;
    for (const key in data) {
      if (data.hasOwnProperty(key) && this[key] !== undefined) {
        if (key === "source" && this.source.name !== data.source.name) {
          newSource = this.schema.models[data.source.name];
        } else if (key === "target" && this.target.name !== data.target.name) {
          newTarget = this.schema.models[data.target.name];
        } else if (key !== "sourceFieldName" && key !== "targetFieldName") {
          this[key] = data[key];
        }
      }
    }
    let sft=5;
    let tft=5;
    switch (data.type) {
      case 1:
        sft=5;
        tft=5;
        break;
      case 2:
        sft=6;
        tft=5;
        break;
      case 3:
        sft=6;
        tft=6;
        break;
    }

    !newSource ? this.source.fields[this.sourceFieldName].changeValues({name: data.sourceFieldName, type: sft, array_field_type: sft===6 ? 5 : 0}) : null;
    this.sourceFieldName=data.sourceFieldName;
    !newTarget ? this.target.fields[this.targetFieldName].changeValues({name: data.targetFieldName, type: tft, array_field_type: tft===6 ? 5 : 0}) : null;
    this.targetFieldName=data.targetFieldName;

    newSource ? this.source.removeRelation(this.id, this.sourceFieldName) : null;
    newTarget ? this.target.removeRelation(this.id, this.targetFieldName) : null;

    if (this.source.id===this.target.id && (newSource || newTarget) && !(newSource && newTarget)){
      //Edge case - adjusting from self loop to non-loop with 1 new party
      if (newSource) newTarget = this.schema.models[data.target.name];
      if (newTarget) newSource = this.schema.models[data.source.name];
    }

    this.source = newSource ? newSource : this.source;
    this.target = newTarget ? newTarget : this.target;

    this.options = data.options;

    newSource ? newSource.addRelation(this) : null;
    newTarget ? newTarget.addRelation(this) : null;

    this.canvasElement.drawArrow();
    this.schema.saveLocally();
  }
}
