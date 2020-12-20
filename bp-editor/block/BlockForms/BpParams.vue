<template>
  <a-form :form="form" @submit="onFormSubmit">
    <a-form-item
      label="Name"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-input
        v-decorator="[
          'name',
          {
            initialValue: field ? field.name : autoGenerateParamName(),
            rules: [
              {
                type: 'string',
                pattern: /^[A-Za-z0-9 _]*$/,
                message: 'Only Latin letters and numbers are allowed!'
              },
              {
                required: true,
                validator: validateName
              }
            ]
          }
        ]"
        placeholder="Name"
      />
    </a-form-item>
    <CreateVariableTypeItem
      :fieldType="fieldType"
      :fieldTypes="fieldTypes"
      :arrayOfType="arrayOfType"
      :isEndBlock="isEndBlock"
      @changeType="changeType"
      :models="models"
      :enums="enums"
      :selectedModelId="selectedModelId"
      :selectedEnumId="selectedEnumId"
    />
    <a-form-item
      v-if="block.type === types.END"
      label="Value"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-select
        v-decorator="[
          'boundValue',
          {
            initialValue: currentBoundValue,
            rules: [
              {
                required: true,
                message: 'Please select value'
              }
            ]
          }
        ]"
        @change="onBoundValueChange"
        placeholder="Select value"
      >
        <a-select-opt-group v-for="block of blocks" :key="block.id">
          <a-row
            type="flex"
            align="middle"
            slot="label"
            style="flex-wrap: nowrap; font-size: 1rem; color: #1890FF"
          >
            <a-icon type="bold" />
            <span
              style="width: 100%; overflow: hidden; text-overflow: ellipsis;"
            >
              {{ block.name }}
            </span>
          </a-row>
          <a-select-option
            v-for="field of filterValuesByTypes(block.fields)"
            :value="field.id"
            :key="field.id"
          >
            {{ field.name }} ({{ `${getValueType(field)}` }})
          </a-select-option>
        </a-select-opt-group>
      </a-select>
    </a-form-item>
  </a-form>
</template>

<script>
import CreateVariableTypeItem from "./CreateVariableTypeItem";
import { Fields, FieldLinks } from "@/components/bp-editor/fields/Fields";
import uuidv4 from "uuid/v4";
import { BlockType } from "../Block";

export default {
  name: "BpParams",
  props: {
    block: Object,
    fieldTypes: Object,
    blocks: Array,
    types: Object,
    isParamsModalOpen: Boolean,
    field: Object,
    arrayOfType: Number,
    getValueType: Function,
    models: Array,
    selectedModelId: String,
    enums: Array,
    selectedEnumId: Number
  },
  data() {
    return {
      form: this.$form.createForm(this, { name: "params" }),
      boundValue:
        this.field && this.block.field_links
          ? this.block.field_links.find(v => v.to_field_id === this.field.id)
          : null,
      fieldType: this.field ? this.field.value_type : undefined
    };
  },
  components: {
    CreateVariableTypeItem
  },
  computed: {
    currentBoundValue() {
      return this.boundValue && this.boundValue.from_model_field_id
        ? this.boundValue.from_model_field_id
        : this.boundValue && this.boundValue.from_field_id
        ? this.boundValue.from_field_id
        : undefined;
    },
    fields() {
      return this.blocks.reduce((v, { fields }) => v.concat(fields), []);
    },
    isEndBlock() {
      return this.block.type === BlockType.END;
    },
    schema() {
      return this.$store.getters.getSchema;
    }
  },
  methods: {
    onBoundValueChange(newBoundValue) {
      if (this.field) {
        const boundField = this.fields.find(v => v.id === newBoundValue);
        if (boundField.field_id) {
          this.boundValue.from_model_field_id = newBoundValue;
          this.boundValue.from_field_id = boundField.field_id;
        } else {
          this.boundValue.from_model_field_id = "";
          this.boundValue.from_field_id = newBoundValue;
        }
        this.boundValue.from_block_id = boundField.block_id;
      }
    },
    close() {
      this.$emit("openModal", false);
      this.form.resetFields();
    },
    onFormSubmit(values) {
      if (!this.field) {
        this.filterFormData(values);
        this.$emit("submit", values);
      } else {
        let boundField = this.fields.find(v => v.id === values.boundValue);
        this.$emit("update", {
          field: {
            ...this.field,
            ...values,
            array_value_type:
              values.value_type === this.fieldTypes.ARRAY && boundField
                ? boundField.array_value_type
                : values.array_value_type
                ? values.array_value_type
                : undefined,
            model_id: values.model_id,
            enum_id: values.enum_id
          },
          boundValue: this.boundValue
        });
        this.close();
      }
    },
    filterFormData(values) {
      //For start params Array type does not work, because there is no array_value_type field. So adding and updating show error.
      let boundField = this.fields.find(v => v.id === values.boundValue);
      values["field"] = new Fields(
        uuidv4(),
        values.value_type,
        2,
        values.name,
        this.block.id,
        values.value_type === this.fieldTypes.ARRAY && boundField
          ? boundField.array_value_type
          : values.array_value_type
          ? values.array_value_type
          : undefined,
        undefined,
        values.model_id,
        undefined,
        values.enum_id
      );
      if (values.boundValue) {
        values.boundValue = new FieldLinks(
          boundField.block_id,
          this.block.id,
          !boundField.field_id ? boundField.id : boundField.field_id,
          values.field.id,
          boundField.field_id ? boundField.id : ""
        );
      }
      return values;
    },
    changeType(newType) {
      this.fieldType = newType;
      if (this.boundValue) {
        this.boundValue.from_field_id = undefined;
        this.boundValue.from_block_id = undefined;
        this.boundValue.from_model_field_id = undefined;
      }
    },
    filterValuesByTypes(fields) {
      return fields.filter(v => v.value_type === this.fieldType);
    },
    validateName(rule, value, callback) {
      if (value.trim() === "") {
        return callback("Please input variable name!");
      } else if (
        this.block.fields &&
        this.block.fields.filter(v => v.id !== (this.field ? this.field.id : null))
        .map(v => v.name.toLowerCase())
        .includes(value.toLowerCase())
      ) {
        return callback("Provided name already exists!");
      }
      callback();
    },
    autoGenerateParamName() {
      let lastNumber = 1;
      if (this.block.fields) {
        let lastNumbers = this.block.fields.map(v => Number(v.name.split("_").shift()))
          .filter(v => !isNaN(v));
        if (lastNumbers.length) {
          lastNumber = Math.max(...lastNumbers) + 1;
        }
      }
      return this.block.type === BlockType.START ? lastNumber + '_Start Param' : lastNumber + '_End Param';
    }
  }
};
</script>
