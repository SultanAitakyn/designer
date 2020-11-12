<template>
  <div>
    <a-form-item
      label="Variable type"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-select
        v-decorator="[
          'value_type',
          {
            initialValue: fieldType,
            rules: [
              {
                required: true,
                message: 'Please select variable type'
              }
            ]
          }
        ]"
        placeholder="Variable type"
        @change="onTypeChange"
      >
        <a-select-option
          v-for="(val, type) in fieldTypes"
          :value="val"
          :key="val"
          >{{ type.toLowerCase() }}</a-select-option
        >
      </a-select>
    </a-form-item>
    <a-form-item
      v-if="(type || fieldType) === fieldTypes.ARRAY && !isEndBlock"
      label="Array of"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-select
        v-decorator="[
          'array_value_type',
          {
            initialValue: arrayType,
            rules: [
              {
                required: true,
                message: 'Please select type of array elements'
              }
            ]
          }
        ]"
        @change="changeArrayOf"
        placeholder="Array of"
      >
        <a-select-option
          v-for="(val, type) in arrayOfTypes"
          :value="val"
          :key="val"
          >{{ type.toLowerCase() }}</a-select-option
        >
      </a-select>
    </a-form-item>
    <a-form-item
      v-if="((arrayType === fieldTypes.MODEL && type === fieldTypes.ARRAY) || type === fieldTypes.MODEL) && !isEndBlock"
      label="Model"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-select
        v-decorator="[
          'model_id',
          {
            initialValue: modelId,
            rules: [
              {
                required: true,
                message: 'Please select model'
              }
            ]
          }
        ]"
        placeholder="Select model"
      >
        <a-select-option
          v-for="model in models"
          :value="model.id"
          :key="model.id"
        >{{ model.name }}</a-select-option
        >
      </a-select>
    </a-form-item>
    <a-form-item
      v-if="((arrayType === fieldTypes.ENUM && type === fieldTypes.ARRAY) || type === fieldTypes.ENUM) && !isEndBlock"
      label="Enum"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-select
        v-decorator="[
          'enum_id',
          {
            initialValue: enumId,
            rules: [
              {
                required: true,
                message: 'Please select enum'
              }
            ]
          }
        ]"
        placeholder="Select enum"
      >
        <a-select-option
          v-for="en in enums"
          :value="en.id"
          :key="en.id"
        >{{ en.name }}</a-select-option
        >
      </a-select>
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: "CreateVariableTypeItem",
  props: {
    fieldType: Number,
    fieldTypes: Object,
    arrayOfType: Number,
    isEndBlock: Boolean,
    models: Array,
    selectedModelId: String,
    enums: Array,
    selectedEnumId: Number
  },
  data() {
    return {
      type: this.fieldType,
      arrayOf: {...this.fieldTypes},
      arrayType: this.arrayOfType,
      modelId: this.selectedModelId,
      enumId: this.selectedEnumId
    };
  },
  computed: {
    arrayOfTypes() {
      delete this.arrayOf["ARRAY"];
      return this.arrayOf;
    }
  },
  methods: {
    onTypeChange(newType) {
      this.type = newType;
      this.arrayType = undefined;
      this.modelId = undefined;
      this.enumId = undefined;
      this.$emit("changeType", newType);
    },
    changeArrayOf(newType) {
      this.arrayType = newType;
      this.modelId = undefined;
      this.enumId = undefined;
    }
  }
};
</script>
