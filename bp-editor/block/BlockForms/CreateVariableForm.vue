<template>
  <a-form-model
    ref="createVariableForm"
    id="blockForm"
    :layout="layout"
    :model="form"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    :rules="rules"
    @submit.prevent="onSubmit"
  >
    <a-form-model-item label="Name" prop="name" hasFeedback validateStatus>
      <a-input v-model="form.name" placeholder="Input block's name"></a-input>
    </a-form-model-item>
    <a-form-model-item label="Variable type" prop="value_type">
      <a-select
        v-model="form.value_type"
        placeholder="Select variable type"
        @change="onTypeChange(false)"
      >
        <a-select-option
          v-for="(val, type) in fieldTypes"
          :value="val"
          :key="val"
          >{{ type.toLowerCase() }}</a-select-option
        >
      </a-select>
    </a-form-model-item>
    <a-form-model-item
      v-if="form.value_type === fieldTypes.ARRAY"
      label="Array of"
      prop="array_value_type"
    >
      <a-select
        v-model="form.array_value_type"
        placeholder="Select array of"
        @change="onTypeChange(true)"
      >
        <a-select-option
          v-for="(val, type) in arrayOfTypes"
          :value="val"
          :key="val"
          >{{ type.toLowerCase() }}</a-select-option
        >
      </a-select>
    </a-form-model-item>
    <a-form-model-item
      v-if="
        (form.array_value_type === fieldTypes.MODEL &&
          form.value_type === fieldTypes.ARRAY) ||
          form.value_type === fieldTypes.MODEL
      "
      label="Model"
      prop="model_id"
    >
      <a-select v-model="form.model_id" placeholder="Select model">
        <a-select-option
          v-for="model in models"
          :value="model.id"
          :key="model.id"
          >{{ model.name }}</a-select-option
        >
      </a-select>
    </a-form-model-item>
    <a-form-model-item
      v-if="
        (form.array_value_type === fieldTypes.ENUM &&
          form.value_type === fieldTypes.ARRAY) ||
          form.value_type === fieldTypes.ENUM
      "
      label="Enum"
      prop="enum_id"
    >
      <a-select v-model="form.enum_id" placeholder="Select enum">
        <a-select-option v-for="en in enums" :value="en.id" :key="en.id">{{
          en.name
        }}</a-select-option>
      </a-select>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import { Block } from "../Block";
import { Fields } from "@/components/bp-editor/fields/Fields";
import uuidv4 from "uuid/v4";

export default {
  name: "CreateVariableForm",
  props: {
    block: Block,
    models: {
      type: Array,
      default: () => []
    },
    enums: {
      type: Array,
      default: () => []
    },
    fieldTypes: Object,
    validateName: Function
  },
  data() {
    return {
      form: {
        name: this.block.name,
        value_type: this.block.fields
          ? this.block.fields[0].value_type
          : this.fieldTypes.NUMBER,
        array_value_type: this.block.fields
          ? this.block.fields[0].array_value_type
          : undefined,
        model_id: this.block.fields ? this.block.fields[0].model_id : undefined,
        enum_id: this.block.fields ? this.block.fields[0].enum_id : undefined
      },
      layout: "horizontal",
      rules: {
        name: [
          {
            validator: this.validateName,
            required: true,
            trigger: "blur"
          },
          {
            type: 'string',
            pattern: /^[A-Za-z0-9 _]*$/,
            message: "Only Latin letters and numbers are allowed!"
          }
        ],
        value_type: [
          {
            required: true,
            trigger: "blur",
            message: "Please select variable type!"
          }
        ],
        array_value_type: [
          {
            required: true,
            trigger: "blur",
            message: "Please select type of array elements!"
          }
        ],
        model_id: [
          {
            required: true,
            trigger: "blur",
            message: "Please select model!"
          }
        ],
        enum_id: [
          {
            required: true,
            trigger: "blur",
            message: "Please select enum!"
          }
        ]
      },
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      arrayTypes: { ...this.fieldTypes }
    };
  },
  computed: {
    arrayOfTypes() {
      delete this.arrayTypes["ARRAY"];
      return this.arrayTypes;
    }
  },
  methods: {
    onSubmit() {
      this.$refs.createVariableForm.validate(err => {
        if (err) {
          this.$emit(
            "onBlockFormSubmit",
            this.prepareDataForBlockUpdating(this.form)
          );
        }
      });
    },
    prepareDataForBlockUpdating(data) {
      const fieldId = this.block.fields ? this.block.fields[0].id : null;
      data["fields"] = [
        new Fields(
          fieldId ? fieldId : uuidv4(),
          data.value_type,
          2,
          data.name,
          this.block.id,
          data.array_value_type,
          data.value,
          data.model_id,
          data.field_of_model_id,
          data.enum_id
        )
      ];
      delete data.enum_id;
      delete data.array_value_type;
      delete data.model_id;
      return data;
    },
    onTypeChange(isArrayTypeChange) {
      this.form.model_id = undefined;
      this.form.enum_id = undefined;
      if (!isArrayTypeChange) {
        this.form.array_value_type = undefined;
      }
    }
  }
};
</script>

<style scoped></style>
