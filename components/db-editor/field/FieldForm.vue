<template>
  <div
    class="editor-form-container"
    :style="{
      top: point.y + 'px',
      left: point.x + 'px'
    }"
  >
    <a-form-model name="fieldForm"
                  ref="fieldForm"
                  :model="formModel"
                  :rules="formRules">
      <a-form-model-item
        ref="name"
        prop="name"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <template slot="label">
          Field name
          <a-tooltip>
            <template slot="title">
              The field name should be descriptive, unique within the model with no special chars and spaces.
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </template>
        <a-input
          :maxLength="31"
          @change="checkSuggestions($event.target.value)"
          v-model="formModel.name"
          placeholder="Field name (required)"
        />
      </a-form-model-item>
      <a-form-model-item
        ref="type"
        prop="type"
        class="m-bottom"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }">
        <template slot="label">
          Field type
          <a-tooltip :mouseEnterDelay="1">
            <template slot="title">
              The field type is a type of data that will be stored inside. While field type can be changed in the future, selecting the best fit for your data is recommended.
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </template>

        <template slot="help" v-if="suggestions.length>0 && !suggestions.includes(vFT)">
          <a-tooltip placement="left" :mouseEnterDelay="1">
            <template slot="title">
              Click to select<br/> suggested field type
            </template>
            <a-icon type="bulb" theme="twoTone" style="margin-right: 4px;"/>
          </a-tooltip>
          <span v-for="(sug,index) in suggestions"
                style="margin-right:4px"
                :key='index'>
            <a @click="()=> applySuggestions(sug)">{{sug}}</a>
          </span>
        </template>
        <a-select
          showSearch
          optionFilterProp="children"
          v-model="vFT"
          placeholder="Field type"
          @change="onTypeChange"
        >
          <a-select-option
            v-for="type in ftypes.filter(x=> ![5,6].includes(x.value))"
            :value="type.value"
            :key="type.name"
            >{{ type.name.toLowerCase() }}</a-select-option
          >
        </a-select>
      </a-form-model-item>

        <a-form-model-item
          label=" "
          :colon="false"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }">
        <a-checkbox @change="onArrayChange" :checked="isArray" :disabled="isArraySelectDisabled">
          Multiple values (Array)
        </a-checkbox>
            <a-tooltip :mouseEnterDelay="1">
              <template slot="title">
                Store multiple values of the same type in this field (e.g. Array{{ vFT ? ' of '+ftypes.find(x=> x.value===vFT).name+'s' : ''}})
              </template>
              <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
            </a-tooltip>
      </a-form-model-item>

      <a-form-model-item
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <template slot="label">
          Description
          <a-tooltip :mouseEnterDelay="1">
            <template slot="title">
              Short descriptions of fields are handy in order not to forget why they were created and will be included in the documentation.
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </template>
        <a-textarea
          :auto-size="{ minRows: 2, maxRows: 3 }"
          v-model="formModel.comment"
          placeholder="What for this field? (recommended)"
        />
      </a-form-model-item>
      <a-form-model-item
        :wrapper-col="{ offset: 2, span: 22 }">
        <a-checkbox v-model="formModel.not_null">
          Not null
          <a-tooltip :mouseEnterDelay="1">
            <template slot="title">
              Field must have a value
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </a-checkbox>
        <a-checkbox v-model="formModel.unique">
          Unique
          <a-tooltip :mouseEnterDelay="1">
            <template slot="title">
              Field value must be unique - users can not create records with duplicates in this field
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </a-checkbox>
        <a-checkbox v-model="formModel.index">
          Index
          <a-tooltip :mouseEnterDelay="1">
            <template slot="title">
              Build index for this field<br/>
              <a-icon type="warning"/> Do not overuse!
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </a-checkbox>
      </a-form-model-item>
      <table-enum-elements v-if="(formModel.type===6 && formModel.array_field_type===7) || formModel.type===7" :enums="enum_values" @change="updateEnums"/>
      <a-form-model-item :wrapper-col="{ span: 24 }">
        <a-col :span="24" :style="{ textAlign: 'right' }">
          <a-button @click="close">
            Cancel
          </a-button>
          <a-button type="primary" @click="onFormSubmit" :style="{ marginLeft: '0.5rem' }">
            Save
          </a-button>
        </a-col>
      </a-form-model-item>
    </a-form-model>

  </div>
</template>

<script>
import paper from "paper";
import moment from "moment";
import { Field, getFieldTypes } from "./Field";
import { getFieldValueTypes } from "@/requests/Apps";
import TableEnumElements from "@/views/main/modals/TableEnumElements";
import { toLower, camelCase } from 'lodash-es';
import {
  checkReservedModelWordsDuplicate,
  checkFirstSymbolIsLetter,
  checkPermittedSymbols,
  checkNameDuplicates,
} from '../utils';

export default {
  name: "FieldForm",
  components:{
    'table-enum-elements' :TableEnumElements,
  },
  props: {
    field: {
      type: Field
    },
    position: {
      type: Object
    }
  },
  data() {
    return {
      formModel: {
        name: this.field ? this.field.name : undefined,
        type: this.field ? this.field.type : undefined,
        array_field_type: this.field ? this.field.array_field_type : undefined,
        comment: this.field ? this.field.comment : undefined,
        not_null: this.field ? this.field.not_null : false,
        unique: this.field ? this.field.unique : false,
        index: this.field ? this.field.index : false,
      },
      formRules: {
        name: [
          { required: true, whitespace: true, message: 'Field name required' },
          { validator: this.fieldNameValidator },
        ],
        type: [
          { required: true, message: 'Field type required'},
        ],
      },
      types: getFieldTypes(this.$store.state.fieldValueTypes),
      ftypes: this.$store.state.fieldValueTypes,
      enum_values: this.field ? this.field.enum_values : [],
      availableValueTypes: [],
      suggestions: [],
      sugArray: [
        { type: "string", fragments: ["name", "title", "address", "serial"]},
        { type: "number", fragments: ["count", "counter"]},
        { type: "boolean", fragments: ["enabled", "disabled", "active", "confirmed"]},
        { type: "time", fragments: ["time"]},
        { type: "date", fragments: ["date"]},
        { type: "email", fragments: ["email"]},
        { type: "phone number", fragments: ["phone", "tel", "telephone"]},
        { type: "text", fragments: ["text", "description", "comment", "message", "info"]},
        { type: "password", fragments: ["password", "pass", "secret", "key", "token"]},
        { type: "enum", fragments: ["status", "category", "type", "severity", "class"]},
        { type: "file", fragments: ["image", "file", "screen", "screenshot", "video", "attachment"]},
        { type: "float", fragments: ["fine", "money", "charge", "penalty", "temperature", "amount"]},
        { type: "geo point", fragments: ["coordinate", "location", "gps"]},
      ],
      isArraySelectDisabled: false,
    };
  },

  watch: {
    vFT(newVal) {
      if(newVal === this.types['Password'] || newVal === this.types['Random string']) {
        this.isArraySelectDisabled = true;
        this.formModel.array_field_type = null;
        this.formModel.type = newVal;
      }
      else this.isArraySelectDisabled = false;
    }
  },

  computed: {
    vFT:{
      get(){
        if (this.isArray) return this.formModel.array_field_type;
        else return this.formModel.type;
      },
      set(v){
        if (this.isArray) this.formModel.array_field_type=v;
        else this.formModel.type=v;
      }
    },

    isArray:{
      get(){
        if (this.formModel.type===6) return true
        else return false;
      }
    },

    point() {
      return paper.project.view.matrix.transform(
        this.field
          ? new paper.Point(
              this.field.canvasElement.group.bounds.rightCenter.x +
                16 / paper.project.view.zoom,
              this.field.canvasElement.group.bounds.rightCenter.y -
                16 / paper.project.view.zoom
            )
          : this.position.point
      );
    }
  },
  methods: {

    applySuggestions(v){
        this.vFT=this.ftypes.find(x=> x.name.toLowerCase()===v).value;
    },

    checkSuggestions(value){
      this.suggestions=[];
      for (let i=0; i< this.sugArray.length; i+=1)
        if (this.sugArray[i].fragments.some(v => value.includes(v)) && this.suggestions.indexOf(this.sugArray[i].type) === -1)
          this.suggestions.push(this.sugArray[i].type);
    },
    onTypeChange(newType) {
      this.type = newType;
    },

    onArrayChange($event){
      if ($event.target.checked){
        this.formModel.array_field_type = this.formModel.type;
        this.formModel.type=6;
      }
      else {
        this.formModel.type=this.formModel.array_field_type;
        this.formModel.array_field_type=0;
      }
    },

    updateEnums(value){
      this.enum_values=value;
    },

    onFormSubmit(event) {
      event.preventDefault();
      this.$refs.fieldForm.validate(valid => {
        if (valid
          && !(((this.formModel.type===6 && this.formModel.array_field_type===7) || this.formModel.type===7) && !this.enum_values.length>0)) {
            this.formModel.default_value = "";
            this.$emit("submit", Object.assign({}, this.formModel, {enum_values: this.enum_values}));
            this.close();
        }
      });
    },

    close() {
      this.$emit("close");
    },
    fieldNameValidator(_, value, callback) {
      try {
        const fieldsList = this.field
        ? this.field.model.fields
        : this.position.model.fields;

        checkFirstSymbolIsLetter(value);
        checkPermittedSymbols(value);
        checkReservedModelWordsDuplicate(value);
        checkNameDuplicates(fieldsList, value, this.field && this.field.id);

        callback();
      } catch (err) {
        callback(err);
      }
    },
  },
};
</script>
<style scoped>
  .m-bottom {
    margin-bottom: 0px;
  }
</style>
