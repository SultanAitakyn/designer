<template>
  <a-form-model
    :layout="layout"
    :model="form"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    :rules="rules"
    ref="form"
  >
    <a-form-model-item label="Case" prop="case">
      <InputManager
        v-model="form.case"
        :data="value"
        :fieldTypes="fieldTypes"
      ></InputManager>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import InputManager from "./InputManager";

export default {
  name: "AddCase",
  props: {
    dataSource: Array,
    value: Object,
    fieldTypes: Object,
    currentEditCase: Object,
    validateNumberAndFloat: Function
  },
  components: { InputManager },
  data() {
    let validateCase = (rule, value, callback) => {
      const cases = this.dataSource.filter(v => !this.currentEditCase).map(v => v.case);
      if (value === undefined || value === "") {
        return callback(new Error("Please input the case!"));
      } else if (cases.includes(value)) {
        return callback(new Error("Case already exists!"));
      }
      callback();
    };
    return {
      layout: "horizontal",
      form: {
        case: this.currentEditCase
          ? this.currentEditCase.case
          : this.value.value_type === this.fieldTypes.BOOLEAN
          ? false
          : "",
        key: this.currentEditCase ? this.currentEditCase.key : ""
      },
      rules: {
        case: [
          { validator: validateCase, required: true, trigger: "blur" },
          { validator: (rule, value, callback) =>
              this.validateNumberAndFloat(
                rule,
                value,
                callback,
                this.value.value_type
              )
          }
          ]
      },
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    };
  },
  watch: { // Validate right value using watch, because ant form item can validate if there are no wrappers. Here we have wrapper inputManager
    "form.case": function(newVal) {
      this.$refs.form.validateField("case");
    }
  },
};
</script>

<style scoped></style>
