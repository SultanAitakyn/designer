<template>
  <a-form-model
    ref="cndForm"
    id="blockForm"
    :layout="layout"
    :model="form"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    :rules="rules"
    @submit.prevent="onSubmit"
  >
    <!--    Condition or Case-->
    <a-form-model-item :wrapper-col="{ span: 22 }" class="mb-2">
      <a-radio-group
        v-if="block.type === BlockType.CONDITION"
        style="text-align: center; width: 100%"
        buttonStyle="solid"
        size="small"
        @change="onConditionCaseBtnChange"
        v-model="form.isConditionButtonSelected"
      >
        <a-radio-button :value="true">Condition</a-radio-button>
        <a-radio-button :value="false">Case</a-radio-button>
      </a-radio-group>
    </a-form-model-item>

    <a-form-model-item label="Name" prop="name" hasFeedback validateStatus>
      <a-input v-model="form.name" placeholder="Input block's name"></a-input>
    </a-form-model-item>

    <CaseForm
      v-if="!form.isConditionButtonSelected"
      :firstVariable="firstVariable"
      :form="form"
      :block="block"
      :enums="enums"
      :getValueType="getValueType"
      :blocks="blocks"
      :fieldTypes="fieldTypes"
      :validateNumberAndFloat="validateNumberAndFloat"
      @addCase="addCase"
      @onCaseDelete="onCaseDelete"
    />

    <a-row type="flex" justify="end" v-if="form.isConditionButtonSelected">
      <a-col :span="9">
        <a-form-model-item
          label="Left value"
          prop="first"
          :label-col="{ span: 10 }"
          :wrapper-col="{ span: 30 }"
        >
          <a-select
            v-model="form.first"
            placeholder="Select value"
            @change="onFirstVarChange"
            :autoFocus="form.first === undefined && true"
          >
            <a-select-opt-group
              v-for="block of blocksForFirstValue"
              :key="block.id"
            >
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
      </a-col>
      <a-col :span="4" :offset="1">
        <a-form-model-item
          v-if="block.type === BlockType.CHANGE_VARIABLE"
          label="Type"
          prop="change_type"
          :label-col="{ span: 11 }"
          :wrapper-col="{ span: 24 }"
        >
          <a-popover title="Change types:" placement="rightTop">
            <a-select v-model="form.change_type">
              <a-select-option
                v-for="(val, type) in changeTypes"
                :value="val"
                :key="val"
                >{{ type }}</a-select-option
              >
            </a-select>
            <template slot="content">
              <p>'=' - Assign to second variable</p>
              <p>'+=' - Add second variable</p>
              <p>'-=' - Subtract second variable</p>
            </template>
          </a-popover>
        </a-form-model-item>
        <a-form-model-item
          v-if="block.type === BlockType.CONDITION"
          label="Operator"
          prop="condition_type"
          :label-col="{ span: 22 }"
          :wrapper-col="{ span: 24 }"
        >
          <a-select v-model="form.condition_type">
            <a-select-option
              v-for="(val, operator) in RelationOps"
              :value="val"
              :key="val"
            >
              {{ operator }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-col>
      <a-col :span="9" :offset="1">
        <a-tooltip placement="bottom">
          <template v-if="form.first === undefined" slot="title"
            >Please, choose left value</template
          >
          <a-form-model-item
            label="Right value"
            prop="second"
            :label-col="{ span: 12 }"
            :wrapper-col="{ span: 30 }"
          >
            <a-select
              v-if="!isSetOwnValueButtonSelected"
              v-model="form.second"
              :placeholder="
                form.first === undefined
                  ? 'Select left value'
                  : 'Select variable'
              "
              :disabled="form.first === undefined && true"
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
                  v-for="field of filterValueByFirst(block.fields)"
                  :value="field.id"
                  :key="field.id"
                >
                  {{ field.name }} ({{ `${getValueType(field)}` }})
                </a-select-option>
              </a-select-opt-group>
            </a-select>

            <!--        Own value-->
            <InputManager
              v-if="isSetOwnValueButtonSelected && dataForInputManager"
              :data="dataForInputManager"
              :fieldTypes="fieldTypes"
              v-model="form.second"
            />
          </a-form-model-item>
        </a-tooltip>

        <a-radio-group
          class="mb-4"
          buttonStyle="solid"
          size="small"
          v-model="isSetOwnValueButtonSelected"
          @change="onRadioButtonChange"
          :disabled="isRadioButtonDisabled"
        >
          <a-radio-button :value="false">Variable</a-radio-button>
          <a-radio-button :value="true">Value</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
  </a-form-model>
</template>

<script>
import { Block, BlockType } from "@/components/bp-editor/block/Block";
import {
  Fields,
  FieldLinks,
  RelationOps
} from "@/components/bp-editor/fields/Fields";
import uuidv4 from "uuid/v4";
import InputManager from "./InputManager";
import CaseForm from "./CaseForm";

const changeTypes = {
  "=": 1,
  "+=": 2,
  "-=": 3
};

export default {
  name: "ConditionForm",
  components: { CaseForm, InputManager },
  props: {
    block: Block,
    fieldTypes: Object,
    blocks: Array,
    getValueType: Function,
    fields: Array,
    enums: Array,
    validateName: Function,
    validateNumberAndFloat: Function
  },
  data() {
    return {
      form: {
        name: this.block.name,
        first: this.getFirstVariable(),
        second: this.getSecondVariable(),
        condition_type: this.block.condition_type
          ? this.block.condition_type
          : this.block.type === BlockType.CONDITION
          ? RelationOps["<"]
          : undefined,
        change_type: this.block.change_type
          ? this.block.change_type
          : this.block.type === BlockType.CHANGE_VARIABLE
          ? changeTypes["="]
          : undefined,
        isConditionButtonSelected: this.block.condition_type !== 7,
        cases: []
      },
      BlockType,
      changeTypes,
      RelationOps,
      isSetOwnValueButtonSelected:
        this.block.fields && this.block.fields[1]
          ? !!this.block.fields[1].value
          : false,
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
        first: [
          {
            required: true,
            trigger: "change",
            message: "Please select value!"
          }
        ],
        second: [
          {
            required: true,
            trigger: "change",
            message: "Please select value!"
          },
          {
            validator: (rule, value, callback) =>
              this.validateNumberAndFloat(
                rule,
                value,
                callback,
                this.firstVariable ? this.firstVariable.value_type : null
              )
          }
        ],
        cases: [
          {
            required: true,
            trigger: "change",
            message: "Please set cases!"
          },
          {
            type: "array",
            min: 2,
            message: "Must be minimum 2 cases!"
          }
        ]
      },
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    };
  },
  watch: { // Validate right value using watch, because ant form item can validate if there are no wrappers. Here we have wrapper inputManager
    "form.second": function(newVal) {
      this.$refs.cndForm.validateField("second");
    }
  },
  computed: {
    schema() {
      return this.$store.getters.getSchema;
    },
    links() {
      return this.schema ? this.schema.data.edges : null;
    },
    firstVariable() {
      return this.fields.find(v => v.id === this.form.first);
    },
    secondVariable() {
      return this.fields.find(v => v.id === this.form.second);
    },
    blocksForFirstValue() {
      return this.block.type === BlockType.CHANGE_VARIABLE
        ? this.blocks.filter(v => v.type === BlockType.CREATE_VARIABLE)
        : this.blocks;
    },
    isRadioButtonDisabled() {
      return this.firstVariable
        ? (this.form.first === undefined && true) ||
            (this.firstVariable.value_type === this.fieldTypes.MODEL && true) ||
            (this.firstVariable.array_value_type === this.fieldTypes.MODEL &&
              true)
        : true;
    },
    dataForInputManager() {
      return this.firstVariable
        ? {
            value_type: this.firstVariable.value_type,
            value: this.form.second
              ? this.form.second
              : this.firstVariable.value_type === this.fieldTypes.BOOLEAN
              ? "false"
              : this.form.second,
            array_value_type: this.firstVariable.array_value_type,
            enum_values: this.firstVariable.enum_id
              ? this.enums.find(x => x.id === this.firstVariable.enum_id).values
              : this.firstVariable.enum_values,
            input_width:
              this.firstVariable.value_type === this.fieldTypes.ARRAY ? 81 : 100
          }
        : null;
    }
  },
  methods: {
    onSubmit() {
      this.$refs.cndForm.validate(err => {
        if (err) {
          this.$emit(
            "onBlockFormSubmit",
            this.prepareDataForBlockUpdating(this.form)
          );
        }
      });
    },
    prepareDataForBlockUpdating(data) {
      let firstField = this.fields.find(v => v.id === data.first);
      let secondField = this.fields.find(v => v.id === data.second);
      if (Array.isArray(data.second)) {
        data.second = !data.second.length ? undefined : data.second;
      }
      if (firstField) {
        data["fields"] = [
          new Fields(
            this.block.fields ? this.block.fields[0].id : uuidv4(),
            firstField ? firstField.value_type : 1,
            1,
            "first",
            this.block.id,
            firstField.array_value_type,
            firstField.value,
            firstField.model_id,
            firstField.field_of_model_id,
            firstField.enum_id
          )
        ];
        data["field_links"] = [
          new FieldLinks(
            firstField.block_id,
            this.block.id,
            !firstField.field_of_model_id
              ? firstField.id
              : firstField.field_of_model_id,
            data.fields[0].id,
            firstField.field_of_model_id ? firstField.id : ""
          )
        ];
      }
      if (data.second !== undefined && !secondField) {
        data.fields.push(
          new Fields(
            this.block.fields && this.block.fields[1]
              ? this.block.fields[1].id
              : uuidv4(),
            firstField.value_type,
            1,
            "second",
            this.block.id,
            firstField.array_value_type,
            data.second, // own right value
            firstField.model_id,
            firstField.field_of_model_id,
            firstField.enum_id
          )
        );
      } else if (secondField) {
        data.fields.push(
          new Fields(
            this.block.fields && this.block.fields[1]
              ? this.block.fields[1].id
              : uuidv4(),
            secondField.value_type,
            1,
            secondField.name,
            this.block.id,
            secondField.array_value_type,
            secondField.value,
            secondField.model_id,
            secondField.field_of_model_id,
            secondField.enum_id
          )
        );
      }
      if (secondField || data.second !== undefined) {
        data.field_links.push(
          new FieldLinks(
            secondField ? secondField.block_id : this.block.id,
            this.block.id,
            !secondField
              ? data.fields[1].id
              : !secondField.field_of_model_id
              ? secondField.id
              : secondField.field_of_model_id,
            data.fields[1].id,
            secondField && secondField.field_of_model_id ? secondField.id : ""
          )
        );
      } else {
        delete data.field_links[1];
      }
      if (data.fields) {
        data.first = data.fields[0].id;
        data.second = data.fields[1] ? data.fields[1].id : undefined;
      }
      return data;
    },
    getFirstVariable() {
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
    getSecondVariable() {
      if (this.block.field_links && this.block.field_links[1]) {
        if (this.block.field_links[1].from_model_field_id) {
          return this.block.fields[1].value
            ? this.block.fields[1].value
            : this.block.field_links[1].from_model_field_id;
        } else {
          return this.block.fields[1].value
            ? this.block.fields[1].value
            : this.block.field_links[1].from_field_id;
        }
      } else {
        return undefined;
      }
    },
    filterValueByFirst(fields) {
      const firstVar = this.fields.find(v => v.id === this.form.first);
      if (firstVar) {
        let displayFields;
        if (firstVar.value_type === this.fieldTypes.ARRAY) {
          displayFields = fields.filter(v => (firstVar.array_value_type === v.array_value_type || v.value_type === firstVar.array_value_type));
        } else {
          displayFields = fields.filter(
            v => v.value_type === firstVar.value_type
          );
        }
        return displayFields;
      }
    },
    onRadioButtonChange() {
      this.form.second = undefined;
    },
    onFirstVarChange() {
      this.form.second = undefined;
      this.isSetOwnValueButtonSelected = false;
    },
    onConditionCaseBtnChange(e) {
      if (e.target.value) {
        this.form.condition_type = 1;
      } else {
        this.form.condition_type = 7;
      }
      this.form.second = undefined;
    },
    addCase(data) {
      const index = this.form.cases.findIndex(v => v.key === data.key);
      if (index !== -1) {
        this.form.cases.splice(index, 1, data);
      } else {
        this.form.cases.push({
          key: this.form.cases.length
            ? this.form.cases[this.form.cases.length - 1].key + 1
            : 0,
          case: data.case
        });
      }
    },
    onCaseDelete(key) {
      let index = this.form.cases.findIndex(v => v.key === key);
      this.form.cases.splice(index, 1);
    }
  },
  beforeMount() {
    if (this.block.first && !this.block.second) {
      this.form.cases = this.links
        .filter(v => v.from.id === this.block.id)
        .map(v => {
          return { case: v.value, key: v.default_order };
        });
      this.form.cases.sort((a, b) => parseFloat(a.key) - parseFloat(b.key));
    } else {
      this.form.cases = [];
    }
  }
};
</script>

<style scoped></style>
