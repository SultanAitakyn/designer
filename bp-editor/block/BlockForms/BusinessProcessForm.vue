<template>
  <a-form-model
    ref="bpForm"
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
    <a-form-model-item label="Business process" prop="bp_id">
      <a-select
        v-model="form.bp_id"
        placeholder="Select business process"
        show-search
        :filterOption="filterOption"
        optionFilterProp="children"
        @change="onBpChange"
      >
        <a-select-opt-group v-for="(group, index) of groupedBusinessP" :key="index">
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
              {{ group.name }}
            </span>
          </a-row>
          <a-select-option
            v-for="bp in group.business_processes" :value="bp.id" :key="bp.id">{{
              bp.name
            }}</a-select-option
          >
        </a-select-opt-group>
      </a-select>
    </a-form-model-item>
    <DataTable
      class="mt-4"
      v-if="businessProcessInputFields.length"
      :data-source="form.dynamicFieldItems"
      :getValueType="getValueType"
      :fields="fields"
      :fieldTypes="fieldTypes"
      @editRow="onEditTableRow"
      @deleteRow="onDeleteTableRow"
    />
    <BpTableEdit
      v-if="isTableRowEdit"
      :is-table-row-edit="isTableRowEdit"
      :row-data="currentTableRow"
      :getValueType="getValueType"
      :blocks="blocks"
      :filterValuesByTypes="filterValuesByTypes"
      :block="block"
      :field-types="fieldTypes"
      :validateNumberAndFloat="validateNumberAndFloat"
      @onRowEditSubmit="onRowEditSubmit"
      @closeEditRow="onCloseEditRow"
    />

    <!--    Selecting available input fields-->
    <div
      v-if="form.bp_id"
      :style="
        businessProcessInputFields.length
          ? 'margin-top: 14px'
          : 'text-align: center'
      "
    >
      <div>
        Available fields
        <a-tooltip>
          <template slot="title">
            Input fields that can be used to manipulate with data. Want more
            fields - create one at <a href="/db">Data Designer</a>
          </template>
          <a-icon
            type="question-circle"
            style="font-size: smaller; vertical-align: baseline;"
          />
        </a-tooltip>
      </div>
      <a-tag
        class="tag-available-fields"
        v-for="field in availableBPInputFields"
        :key="field.name"
        @click="createNewFormItem(field)"
      >
        {{ field.name }}</a-tag
      >
      <span style="color: #000000">{{ availableBPInputFieldsLabel }}</span>
    </div>
  </a-form-model>
</template>

<script>
import { Block } from "@/components/bp-editor/block/Block";
import { FieldLinks } from "@/components/bp-editor/fields/Fields";
import DataTable from "./DataTable";
import BpTableEdit from "./BpTableEdit";

export default {
  name: "BusinessProcessForm",
  components: { BpTableEdit, DataTable },
  props: {
    businessProcesses: {
      type: Array,
      default: () => []
    },
    block: Block,
    fieldTypes: Object,
    blocks: Array,
    fields: Array,
    getValueType: Function,
    validateName: Function,
    groupedBusinessP: Array,
    validateNumberAndFloat: Function
  },
  data() {
    return {
      form: {
        name: this.block.name,
        bp_id: this.block.bp_id ? this.block.bp_id : undefined,
        dynamicFieldItems: []
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
            type: "string",
            pattern: /^[A-Za-z0-9 _]*$/,
            message: "Only Latin letters and numbers are allowed!"
          }
        ],
        bp_id: [
          {
            required: true,
            trigger: "change",
            message: "Please select business process!"
          }
        ]
      },
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      isTableRowEdit: false,
      currentTableRow: null,
      value: undefined,
      expandedBpTreeNodes: [],
      isBpSelectDropDownVisible: false
      //isAbleToHideNode: true
    };
  },
  computed: {
    schema() {
      return this.$store.getters.getSchema;
    },
    selectedBusinessProcess() {
      return this.businessProcesses.find(v => v.id === this.form.bp_id);
    },
    getSelectedBpAllFields() {
      return this.selectedBusinessProcess
        ? this.schema.expandModelFields(
            this.selectedBusinessProcess.fields,
            this.block.id
          )
        : null;
    },
    businessProcessInputFields() {
      return this.getSelectedBpAllFields
        ? this.getSelectedBpAllFields.filter(v => v.type === 1)
        : [];
    },
    availableBPInputFields() {
      return this.businessProcessInputFields.filter(
        v =>
          !this.form.dynamicFieldItems
            .map(data => data.inputField.id)
            .includes(v.id)
      );
    },
    availableBPInputFieldsLabel() {
      return !this.businessProcessInputFields.length
        ? "This business process has no input fields"
        : this.businessProcessInputFields.length &&
          !this.availableBPInputFields.length
        ? "All business process input fields are used"
        : null;
    }
  },
  methods: {
    onSubmit() {
      this.$refs.bpForm.validate(err => {
        if (err) {
          this.$emit(
            "onBlockFormSubmit",
            this.prepareDataForBlockUpdating(this.form)
          );
        }
      });
    },
    prepareDataForBlockUpdating(data) {
      let field_links = [];
      let inputField;
      let fields = [];
      for (const field of this.selectedBusinessProcess.fields) {
        fields.push({
          ...field,
          block_id: this.block.id
        });
      }
      if (data.dynamicFieldItems.length) {
        for (const item of data.dynamicFieldItems) {
          inputField = item.inputField;
          let connectedField = item.connectedField;
          if (connectedField) {
            if (item.isConnectedIsOwnValue) {
              fields.find(v => v.id === inputField.id).value = connectedField;
            } else {
              connectedField = this.fields.find(v => v.id === connectedField);
              field_links.push(
                new FieldLinks(
                  connectedField ? connectedField.block_id : undefined,
                  this.block.id,
                  !connectedField.field_of_model_id
                    ? connectedField.id
                    : connectedField.field_of_model_id,
                  inputField.id,
                  connectedField.field_of_model_id
                    ? connectedField.id
                    : undefined
                )
              );
            }
          }
        }
      }
      data["fields"] = fields;
      data["field_links"] = field_links;
      delete data.dynamicFieldItems;
      return data;
    },
    createNewFormItem(inputField) {
      this.form.dynamicFieldItems.push({
        inputField,
        connectedField: undefined,
        isConnectedIsOwnValue: false
      });
    },
    filterValuesByTypes(type, fields) {
      return fields.filter(v => v.value_type === type);
    },
    onEditTableRow(data) {
      this.currentTableRow = data;
      this.isTableRowEdit = true;
    },
    onDeleteTableRow(data) {
      let index = this.form.dynamicFieldItems.findIndex(
        v => v.inputField.id === data.inputField.id
      );
      if (index !== -1) {
        this.form.dynamicFieldItems.splice(index, 1);
      }
    },
    onRowEditSubmit(data) {
      const index = this.form.dynamicFieldItems.findIndex(
        v => v.inputField.id === data.inputField.id
      );
      this.form.dynamicFieldItems.splice(index, 1, data);
      this.isTableRowEdit = false;
    },
    onCloseEditRow(bool) {
      this.isTableRowEdit = bool;
    },
    filterOption(input, option) {
        if (option.componentOptions.children[0].text) {
        return (
          option.componentOptions.children[0].text
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0
        );
      }
    },
    onBpChange() {
      this.form.dynamicFieldItems = [];
    }
  },
  beforeMount() {
    for (const inputField of this.businessProcessInputFields) {
      if (this.block.field_links) {
        const fieldLinkOfInputField = this.block.field_links.find(
          v => v.to_field_id === inputField.id
        );
        if (fieldLinkOfInputField) {
          const connectedField = fieldLinkOfInputField.from_model_field_id
            ? fieldLinkOfInputField.from_model_field_id
            : fieldLinkOfInputField.from_field_id;
          this.form.dynamicFieldItems.push({
            inputField,
            connectedField,
            isConnectedIsOwnValue: false
          });
        }
      }
      if (this.block.fields) {
        const blockField = this.block.fields.find(v => v.id === inputField.id);
        if (blockField.value) {
          this.form.dynamicFieldItems.push({
            inputField: blockField,
            connectedField: blockField.value,
            isConnectedIsOwnValue: true
          });
        }
      }
    }
  }
};
</script>

<style scoped>
.tag-available-fields {
  margin-top: 6px;
  cursor: pointer;
}
.tag-available-fields:hover {
  color: #589cff;
  background: #e6f7ff;
  border-color: #bbe5ff;
}
</style>
