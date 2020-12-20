import uuidv4 from "uuid/v4";

export class Link {
  constructor(from, to, x, y, value, default_order) {
      this.id = uuidv4();
      this.from = from;
      this.to = to;
      this.x = x;
      this.y = y;
      this.value = value;
      if (default_order !== undefined) {
        this.default_order = default_order;
      }
  }

  changeValues(data) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
    this.initCanvasElement();
  }
}
