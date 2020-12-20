const blockTypes = {
  BP: 1,
  CONDITION: 2,
  CYCLE: 3,
  CREATE_VARIABLE: 4,
  CHANGE_VARIABLE: 5,
  CYCLE_END: 6
};

// Object.defineProperty(blockTypes, "CYCLE_END", {
//   value: 6,
//   enumerable: false
// });
Object.defineProperty(blockTypes, "START", {
  value: 7,
  enumerable: false
});
Object.defineProperty(blockTypes, "END", {
  value: 8,
  enumerable: false
});

export const BlockType = Object.freeze(blockTypes);

export class Block {
  constructor(
    id,
    name,
    type,
    fields = null,
    async = false,
    params = null,
    x,
    y,
    process = null,
    bp_id = null,
    condition_type = null,
    first,
    second,
    change_type,
    field_links
  ) {
    // TODO: change accordingly
    if (type >= 0 && type <= 8) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.async = async;
      this.params = params;
      this.process = process;
      this.first = first;
      this.second = second;
      this.change_type = change_type;
      this.field_links = field_links;
      this.x = x;
      this.y = y;
      if (type === BlockType.CYCLE) {
        this.height = 200;
      }
      if (type === BlockType.START) {
        this.fields =
          fields && fields.length ? fields.map(v => ({ ...v, type: 2 })) : null;
      } else if (type === BlockType.END) {
        this.fields = fields && fields.length ? fields : null;
      } else {
        this.fields = fields;
      }
      if (type === BlockType.BP) {
        this.bp_id = bp_id;
      } else if (type === BlockType.CONDITION) {
        this.condition_type = condition_type;
      }
    } else {
      throw new Error("invalid block type");
    }
    if (type === BlockType.START) {
      this.blockType = "start";
      this.x = 40;
      this.y = 281;
    } else if (type === BlockType.END) {
      this.blockType = "end";
      this.x = x ? x : 40;
      this.y = 281;
    } else {
      this.blockType = Object.keys(blockTypes).find(
        key => blockTypes[key] === this.type
      );
    }
  }

  changeValues(data) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (key !== "cases") {
          this[key] = data[key];
        }
      }
    }
  }
}
