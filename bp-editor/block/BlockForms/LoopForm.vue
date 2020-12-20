<template>
  <a-form-model
    ref="loopForm"
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
    <a-form-model-item label="Variable" prop="field">
      <a-select v-model="form.field" placeholder="Select variable">
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
            v-for="field of block.fields"
            :value="field.id"
            :key="field.id"
          >
            {{ field.name }} ({{ `${getValueType(field)}` }})
          </a-select-option>
        </a-select-opt-group>
      </a-select>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import { Block } from "@/components/bp-editor/block/Block";
import { Fields, FieldLinks } from "@/components/bp-editor/fields/Fields";
import uuidv4 from "uuid/v4";

export default {
  name: "LoopForm",
  props: {
    block: Block,
    fieldTypes: Object,
    blocks: Array,
    getValueType: Function,
    fields: Array,
    validateName: Function
  },
  data() {
    return {
      form: {
        name: this.block.name,
        field: this.getCurrentField()
      },
      layout: "horizontal",
      rules: {
        name: [
          {
            validator: this.validateName,
            required: true,
            trigger: "blur",
          },
          {
            type: 'string',
            pattern: /^[A-Za-z0-9 _]*$/,
            message: "Only Latin letters and numbers are allowed!"
          }
        ],
        field: [
          {
            required: true,
            trigger: "blur",
            message: "Please select variable!"
          }
        ]
      },
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    };
  },
  methods: {
    getCurrentField() {
      if (this.block.field_links) {
        if (this.block.field_links[0].from_model_field_id) {
          return this.block.field_links[0].from_model_field_id;
        } else {
          return this.block.field_links[0].from_field_id;
        }
      } else {
        return undefined;
      }
    },
    onSubmit() {
      this.$refs.loopForm.validate(err => {
        if (err) {
          this.$emit(
            "onBlockFormSubmit",
            this.prepareDataForBlockUpdating(this.form)
          );
        }
      });
    },
    prepareDataForBlockUpdating(data) {
      let field = this.fields.find(v => v.id === data.field);
      let fields = [];
      fields.push(
        new Fields(
          this.block.fields ? this.block.fields[0].id : uuidv4(),
          field.value_type,
          1,
          field.name,
          this.block_id,
          field && field.array_value_type
            ? field.array_value_type
            : field && field.array_field_type
            ? field.array_field_type
            : 1,
          field.value,
          field.model_id,
          field.field_of_model_id,
          field.enum_id
        ),
        new Fields(
          this.block.fields ? this.block.fields[1].id : uuidv4(),
          field && field.array_value_type
            ? field.array_value_type
            : field && field.array_field_type
            ? field.array_field_type
            : 1,
          2,
          data.name,
          this.block.id,
          undefined,
          field.value,
          field.model_id,
          undefined, //field.field_of_model_id,
          field.enum_id
        )
      );
      if (field) {
        data["field_links"] = [
          new FieldLinks(
            field.block_id,
            this.block.id,
            !field.field_of_model_id ? field.id : field.field_of_model_id,
            fields[0].id,
            field.field_of_model_id ? field.id : ""
          )
        ];
      }
      data["fields"] = fields;
      return data;
    }
  }
};
</script>

<style scoped></style>
