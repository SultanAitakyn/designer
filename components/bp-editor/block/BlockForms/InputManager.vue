<template>
  <component v-bind:is="currentFormItem" :element="valueForCustomInputItem" :value="valueForCustomInputItem.defaultValue" @input="input"></component>
</template>

<script>
  import ApmInput from "../../../../views/main/back-office/designer/components/apm-input/apm-input";
  import ApmInputNumber from "../../../../views/main/back-office/designer/components/apm-input-number/apm-input-number";
  import ApmDateTimePicker from '@/views/main/back-office/designer/components/apm-datetime-picker/apm-datetime-picker';
  import ApmInputPassword from "../../../../views/main/back-office/designer/components/apm-input-password/apm-input-password";
  import ApmInputEmail from "../../../../views/main/back-office/designer/components/apm-input-email/apm-input-email";
  import ApmDatePicker from "../../../../views/main/back-office/designer/components/apm-date-picker/apm-date-picker";
  import ApmTimePicker from "../../../../views/main/back-office/designer/components/apm-time-picker/apm-time-picker";
  import ApmInputText from "../../../../views/main/back-office/designer/components/apm-input-text/apm-input-text";
  import ApmInputPhone from "../../../../views/main/back-office/designer/components/apm-input-phone/apm-input-phone";
  import ApmInputGeopoint
    from "../../../../views/main/back-office/designer/components/apm-input-geopoint/apm-input-geopoint";
  import ApmInputs from "../../../../views/main/back-office/designer/components/apm-inputs/apm-inputs";
  import ApmInputNumbers from '@/views/main/back-office/designer/components/apm-input-numbers/apm-input-numbers';
  import ApmDateTimePickers
    from "../../../../views/main/back-office/designer/components/apm-datetime-pickers/apm-datetime-pickers";
  import ApmInputPasswords
    from "../../../../views/main/back-office/designer/components/apm-input-passwords/apm-input-passwords";
  import ApmInputEmails from "../../../../views/main/back-office/designer/components/apm-input-emails/apm-input-emails";
  import ApmDatePickers from "../../../../views/main/back-office/designer/components/apm-date-pickers/apm-date-pickers";
  import ApmTimePickers from "../../../../views/main/back-office/designer/components/apm-time-pickers/apm-time-pickers";
  import ApmInputTexts from "../../../../views/main/back-office/designer/components/apm-input-texts/apm-input-texts";
  import ApmInputGeopoints
    from "../../../../views/main/back-office/designer/components/apm-input-geopoints/apm-input-geopoints";
  import ApmCheckbox from "../../../../views/main/back-office/designer/components/apm-checkbox/apm-checkbox";
  import ApmEnum from "../../../../views/main/back-office/designer/components/apm-enum/apm-enum";
  import ApmEnums from "../../../../views/main/back-office/designer/components/apm-enums/apm-enums";

  export default {
    name: "InputManager",
    components: {
      ApmEnums,
      ApmEnum,
      ApmCheckbox,
      ApmInputGeopoints,
      ApmInputTexts,
      ApmTimePickers,
      ApmDatePickers,
      ApmInputEmails,
      ApmInputPasswords,
      ApmDateTimePickers,
      ApmInputNumbers,
      ApmInputs,
      ApmInputGeopoint,
      ApmInputPhone,
      ApmInputText,
      ApmTimePicker,
      ApmDatePicker, ApmInputEmail, ApmInputPassword, ApmDateTimePicker, ApmInputNumber, ApmInput},
    props: {
      data: Object,
      fieldTypes: Object
    },
    computed: {
      currentFormItem() {
        return this.getCurrentFormItem(this.data);
      },
      valueForCustomInputItem() {
        return this.prepareValueForInputItem(this.data);
      }
    },
    methods: {
      getCurrentFormItem(data) {
        switch (data.value_type) {
          case this.fieldTypes.NUMBER:
            return 'ApmInputNumber';
          case this.fieldTypes.STRING:
            return 'ApmInput';
          case this.fieldTypes.DATETIME:
            return 'ApmDateTimePicker';
          case this.fieldTypes.BOOLEAN:
            return 'ApmCheckbox';
          case this.fieldTypes.PASSWORD:
            return 'ApmInputPassword';
          case this.fieldTypes.EMAIL:
            return 'ApmInputEmail';
          case this.fieldTypes.ENUM:
            return 'ApmEnum';
          case this.fieldTypes.DATE:
            return 'ApmDatePicker';
          case this.fieldTypes.TIME:
            return 'ApmTimePicker';
          case this.fieldTypes.TEXT:
            return 'ApmInputText';
          case this.fieldTypes.FLOAT:
            return 'ApmInputNumber';
          // case this.fieldTypes['GEO POINT']:
          //   return 'ApmInputGeopoint';
          case this.fieldTypes.ARRAY:
            return this.getFormItemForArray(data.array_value_type);
          default:
            return 'ApmInput';
        }
      },
      getFormItemForArray(type) {
        switch (type) {
          case this.fieldTypes.NUMBER:
            return 'ApmInputNumbers';
          case this.fieldTypes.STRING:
            return 'ApmInputs';
          case this.fieldTypes.DATETIME:
            return 'ApmDateTimePickers';
          case this.fieldTypes.PASSWORD:
            return 'ApmInputPasswords';
          case this.fieldTypes.EMAIL:
            return 'ApmInputEmails';
          case this.fieldTypes.ENUM:
            return 'ApmEnums';
          case this.fieldTypes.DATE:
            return 'ApmDatePickers';
          case this.fieldTypes.TIME:
            return 'ApmTimePickers';
          case this.fieldTypes.TEXT:
            return 'ApmInputTexts';
          case this.fieldTypes.FLOAT:
            return 'ApmInputNumbers';
          // case this.fieldTypes['GEO POINT']:
          //   return 'ApmInputGeopoints';
          default:
            return 'ApmInputs';
        }
      },
      input(v) {
        this.$emit('input', v != null ? v.toString() : v);
      },
      prepareValueForInputItem(data) {
        if (data.value_type === this.fieldTypes.ARRAY && data.value ) {
          data.value = data.array_value_type === this.fieldTypes.ENUM ? data.value.split(",").map(v => Number(v)) : data.value.split(",");
        } else if (data.value_type === this.fieldTypes.BOOLEAN) {
          data.value = data.value === 'true' && true;
        } else if (data.value_type === this.fieldTypes.ENUM && data.value) {
          data.value = Number(data.value);
        }
        return {
          disabled: false,
          defaultValue: data.value,
          size: 'default',
          placeholder: 'Input value',
          enum_values: data.enum_values,
          input_width: data.input_width,
        }
      }
    },
  };
</script>

<style scoped></style>
