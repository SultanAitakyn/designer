<template>
  <a-modal
    v-model="isModalOpen"
    title="Edit row"
    :destroyOnClose="true"
    @ok="handleSubmit"
  >
    <a-form-model
      :layout="layout"
      :model="form"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :rules="rules"
      ref="form"
      :hideRequiredMark="true"
    >
      <a-form-model-item
        :key="form.inputField.id"
        prop="connectedField"
        :colon="false"
      >
        <span slot="label" class="wrap-label">
          {{
            `${form.inputField.name +
              " (" +
              getValueType(form.inputField) +
              ") :"}`
          }}
        </span>
        <a-select
          v-model="form.connectedField"
          placeholder="Select variable"
          style="width: 89%;"
          v-if="!form.isConnectedIsOwnValue"
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
              v-for="field of filterValuesByTypes(
                form.inputField.value_type,
                block.fields
              )"
              :value="field.id"
              :key="field.id"
            >
              {{ field.name }} ({{ `${getValueType(field)}` }})
            </a-select-option>
          </a-select-opt-group>
        </a-select>

        <InputManager
          style="width: 89%;"
          v-if="form.isConnectedIsOwnValue"
          :data="getDataForInputManager(rowData)"
          v-model="form.connectedField"
          :fieldTypes="fieldTypes"
        />
        <a-radio-group
          buttonStyle="solid"
          size="small"
          v-model="form.isConnectedIsOwnValue"
          @change="onRadioButtonChange()"
          :disabled="false"
        >
          <a-radio-button :value="false">Variable</a-radio-button>
          <a-radio-button :value="true">Value</a-radio-button>
        </a-radio-group>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import InputManager from "./InputManager";

export default {
  name: "BpTableEdit",
  components: { InputManager },
  props: {
    rowData: Object,
    isTableRowEdit: Boolean,
    getValueType: Function,
    blocks: Array,
    filterValuesByTypes: Function,
    fieldTypes: Object,
    block: Object,
    validateNumberAndFloat: Function
  },
  data() {
    return {
      layout: "horizontal",
      form: {
        connectedField: this.rowData.connectedField,
        isConnectedIsOwnValue: this.rowData.isConnectedIsOwnValue,
        inputField: this.rowData.inputField
      },
      rules: {
        connectedField: [
          {
            required: true,
            trigger: "change",
            message: "Please select variable or set own value"
          },
          {
            validator: (rule, value, callback) =>
              this.validateNumberAndFloat(
                rule,
                value,
                callback,
                this.form.inputField.value_type
              )
          }
        ]
      },
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    };
  },
  computed: {
    isModalOpen: {
      get() {
        return this.isTableRowEdit;
      },
      set(newBool) {
        this.$emit("closeEditRow", newBool);
      }
    }
  },
  watch: { // Validate right value using watch, because ant form item can validate if there are no wrappers. Here we have wrapper inputManager
    "form.connectedField": function(newVal) {
      this.$refs.form.validateField("connectedField");
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.form.validate(err => {
        if (err) {
          this.$emit("onRowEditSubmit", this.form);
        }
      });
    },
    getDataForInputManager(data) {
      return {
        value_type: data.inputField.value_type,
        value: this.form.connectedField
          ? this.form.connectedField
          : data.inputField.value_type === this.fieldTypes.BOOLEAN
          ? "false"
          : this.form.connectedField,
        array_value_type: data.inputField.array_value_type,
        enum_values: data.inputField.enum_values
      };
    },
    onRadioButtonChange() {
      this.form.connectedField = this.form.inputField.value_type === this.fieldTypes.BOOLEAN ? false : undefined;
    }
  }
};
</script>

<style scoped>
.wrap-label {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
  width: 150px;
}
.wrap-label::before {
  display: inline-block;
  margin-right: 4px;
  color: #f5222d;
  font-size: 14px;
  font-family: SimSun, sans-serif;
  line-height: 1;
  content: "*";
}
</style>
