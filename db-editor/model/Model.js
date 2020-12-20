import uuidv4 from "uuid/v4";
import { Field } from "../field/Field";
import { ModelCanvasElement } from "./ModelCanvasElement";

export const ModelOrderType = Object.freeze({
  ASC: 0,
  DESC: 1
});

export class Model {
  constructor(
    id,
    schema,
    name,
    comment,
    left,
    top,
    color = "#000",
    module_model_id,
    relation_options,
  ) {
    this.id = id;
    this.schema = schema;
    this.name = name;
    this.comment = comment;
    this.left = left;
    this.top = top;
    this.color = color;
    this.module_model_id = module_model_id;
    this.relation_options = relation_options;
    this.fields = {};
    this.relations = {};
    this.validators = {};
    this.permissions = {};
    this.canvasElement = new ModelCanvasElement(this);
  }

  destroy() {
    this.canvasElement.destroy();
    for (const relation in this.relations) {
      if (this.relations.hasOwnProperty(relation)) {
        const rel = this.relations[relation];
        rel.destroy();
        delete rel.source.relations[relation];
        delete rel.target.relations[relation];
      }
    }
  }

  changeValues(data) {
    for (const key in data) {
      if (data.hasOwnProperty(key) && this[key] !== undefined) {
        if (key === "name") {
          delete this.schema.models[this.name];
          this.name = data.name;
          this.canvasElement.changeTitle();
        } else {
          this[key] = data[key];
          this.schema.models[data.name] = this;
          if (key === "color") {
            this.canvasElement.changeColor();
          }
        }
      }
    }
    this.schema.saveLocally();
  }

  addField(field = new Field(uuidv4(), this.schema, this, uuidv4(), 0)) {
    if (!this.fields.hasOwnProperty(field.name)) {
      this.fields[field.name] = field;
      this.canvasElement.addField(field);
      this.schema.adjustDimensions(this.canvasElement.group.bounds.bottomRight);
      this.schema.saveLocally();
    }
  }

  removeField(key) {
    if (this.fields.hasOwnProperty(key)) {
      this.canvasElement.removeField(this.fields[key]);
      delete this.fields[key];
      this.schema.saveLocally();
    }
  }

  addRelation(relation) {
    if (!this.relations.hasOwnProperty(relation.id)) {
    if ((this.id===relation.source.id && !this.fields[relation.sourceFieldName])
        || (this.id===relation.target.id && !this.fields[relation.targetFieldName])) {
      let fieldName=this.id===relation.source.id ? relation.sourceFieldName : relation.targetFieldName;
      let type = this.id===relation.source.id ? (relation.type===1 ? 5 : 6) : (relation.type===3 ? 6 : 5)
      let avt = type === 6 ? 5 : 0;
      this.addField(
        new Field(
          uuidv4(),
          this.schema,
          this,
          fieldName,
          'System generated relation field',
          type,
          avt,
          true,
          null,
          false,
          false,
          false,
          1,
          [])
      );
    }
      this.relations[relation.id] = relation;
      this.schema.saveLocally();
    }
  }

  removeRelation(key, field) {
    if (this.relations.hasOwnProperty(key)) {
      this.removeField(field);
      delete this.relations[key];
      this.schema.saveLocally();
    }
  }

  checkFieldUniqieness(value){
    const fieldsList = this.fields;
    for (const field in fieldsList) {
      if (fieldsList.hasOwnProperty(field)) {
        if (field && field.toLowerCase() === value.toLowerCase()) {
         return false;
        }
      }
    }
    return true;
  }

  checkRelationUniqueness(model, beingEditedRelation = null) {
    for (const relation in this.relations) {
      if (this.relations.hasOwnProperty(relation)) {
        if (
          (!beingEditedRelation || relation !== beingEditedRelation.id) &&
          ((this.relations[relation].source.name === this.name &&
            this.relations[relation].target.name === model) ||
            (this.relations[relation].source.name === model &&
              this.relations[relation].target.name === this.name))
        ) {
          return false;
        }
      }
    }
    return true;
  }

  addValidator(validator) {
    this.validators[validator.key] = validator;
  }

  removeValidator(key) {
    delete this.validators[key];
  }

  addPermission(permission) {
    this.permissions[permission.key] = permission;
  }

  removePermission(key) {
    delete this.permissions[key];
  }
}
