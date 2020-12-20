export const Condition = Object.freeze({
  GREATER_THAN: 0,
  LESS_THAN: 1,
  GREATER_THAN_OR_EQUALS: 2,
  LESS_THAN_OR_EQUALS: 3,
  EQUALS: 4,
  NOT_EQUALS: 5,
  CONTAINS: 6
});

export class Validator {
  constructor(name, condition, value, order) {
    if (Number.isInteger(condition) && condition >= 0 && condition <= 6) {
      this.name = name;
      this.condition = condition;
      this.value = value;
      this.order = order;
    } else {
      throw new Error("invalid validator condition");
    }
  }
}
