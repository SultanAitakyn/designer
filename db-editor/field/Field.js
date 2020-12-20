import { FieldCanvasElement } from "./FieldCanvasElement";

const getFieldTypesObjectFromArray = array => {
  const obj = {};
  array.forEach(item => (obj[item.name] = item.value));
  return obj;
};

export const getTypeNameById = (id, types) => {
  const type = types.find(type => type.value === id);
  return type ? type.name : undefined;
};

export const getFieldTypes = fieldTypes => {
  const fieldsTypesObject = getFieldTypesObjectFromArray(fieldTypes);
  return Object.freeze(fieldsTypesObject);
};

export class Field {
  constructor(
    id,
    schema,
    model,
    name,
    comment,
    type,
    array_field_type = null,
    generated = false,
    default_value = null,
    not_null = false,
    unique = false,
    index = false,
    default_order = 1,
    enum_values= [],
    enum_id= null
  ) {
    if (Number.isInteger(type) && type >= 0) {
      this.id = id;
      this.schema = schema;
      this.model = model;
      this.name = name;
      this.comment = comment;
      this.type = type;
      this.array_field_type = array_field_type;
      this.generated= generated;
      this.default_value = default_value;
      this.not_null = not_null;
      this.unique = unique;
      this.index = index;
      this.default_order = default_order;
      this.enum_values = enum_values;
      this.enum_id = enum_id;
      this.validators = [];
      this.canvasElement = new FieldCanvasElement(this);
    } else {
      throw new Error("invalid field type");
    }
  }

  changeValues(data) {
    for (const key in data) {
      if (data.hasOwnProperty(key) && this[key] !== undefined) {
        if (key === "name") {
          delete this.model.fields[this.name];
          this.model.fields[data.name] = this;
          this.name = data.name;
          this.canvasElement.changeTitle();
        } else {
          this[key] = data[key];
          if (key === "type" || key === "array_field_type") {
            this.canvasElement.changeTitle();
          }
        }
      }
    }
    this.schema.saveLocally();
  }
}
