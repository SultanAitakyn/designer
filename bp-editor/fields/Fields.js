const getFieldTypesObjectFromArray = array => {
  const obj = {};
  array.forEach(item => (obj[item.name.toUpperCase()] = item.value));
  return obj;
};

export const getFieldTypes = fieldTypes => {
  const fieldsTypesObject = getFieldTypesObjectFromArray(fieldTypes);
  return Object.freeze(fieldsTypesObject);
};

const relationOps = {
  "<": 1,
  "<=": 2,
  ">": 3,
  ">=": 4,
  "==": 5,
  "!=": 6
};

Object.defineProperty(relationOps, "getTypeByValue", {
  value: function(value) {
    return Object.keys(this).find(key => this[key] === value);
  },
  enumerable: false
});
export const RelationOps = Object.freeze(relationOps);

export class Fields {
  constructor(id, value_type, type, name, block_id, array_value_type, value, model_id, field_of_model_id, enum_id) {
    this.id = id;
    this.value_type = value_type;
    this.type = type;
    this.name = name;
    this.block_id = block_id;
    this.array_value_type = array_value_type;
    this.value = value;
    this.model_id = model_id;
    this.field_of_model_id = field_of_model_id;
    this.enum_id = enum_id;
  }
}

export class FieldLinks {
  constructor(
    from_block_id,
    to_block_id,
    from_field_id,
    to_field_id,
    from_model_field_id
  ) {
    this.from_block_id = from_block_id;
    this.to_block_id = to_block_id;
    this.from_field_id = from_field_id;
    this.from_model_field_id = from_model_field_id;
    this.to_field_id = to_field_id;
  }
}
