const types = {
  number: 'number',
  string: 'string',
  boolean: 'boolean',
}

export default {
  props: {
    legacy: {
      type: Boolean,
      default: false,
      validate: function(value) {
        return typeof value === types.boolean;
      },
    },
    block: {
      type: Boolean,
      default: false,
      validate: function(value) {
        return typeof value === types.boolean;
      },
    },
    type: {
      type: String,
      default: '',
      validate: function(value) {
        return typeof value === types.string;
      },
    },
    size: {
      type: String,
      default: 'default',
      validate: function(value) {
        return typeof value === types.string;
      },
    },
    icon: {
      type: Boolean,
      default: false,
      validate: function(value) {
        return typeof value === types.boolean;
      }
    }
  },
}