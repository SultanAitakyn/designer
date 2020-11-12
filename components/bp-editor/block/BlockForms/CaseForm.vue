<template>
  <div>
    <a-form-model-item label="Value" prop="first" class="mt-4">
      <a-select v-model="form.first" placeholder="Select value">
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

    <a-form-model-item
      prop="cases"
      :wrapper-col="{ span: 30 }"
    >
      <div>
        <a-row>
          <a-col>
            <a-tooltip>
              <template v-if="!form.first" slot="title"
                >Please, select value before adding cases</template
              >
              <a-button
                :disabled="!form.first"
                size="small"
                type="dashed"
                style="margin-bottom: 10px;"
                @click="onCaseAddButton"
                >+ Add case</a-button
              >
            </a-tooltip>
          </a-col>
        </a-row>
        <a-row>
          <a-col>
            <a-table
              :pagination="false"
              :data-source="form.cases"
              :columns="columns"
              size="small"
            >
              <template slot="case" slot-scope="text, record">
                {{ getCaseLabel(record) }}
              </template>
              <template slot="type">
                {{ firstVariable ? getValueType(firstVariable) : '' }}
              </template>
              <template slot="action" slot-scope="text, record">
                <a-tooltip>
                  <template slot="title">
                    Edit case
                  </template>
                  <a-icon
                    type="setting"
                    :style="{ marginLeft: '8px' }"
                    @click="editCase(record.key)"
                  />
                </a-tooltip>
                <a-tooltip>
                  <template slot="title">
                    Delete this case
                  </template>
                  <a-icon
                    type="delete"
                    style="color: red;"
                    :style="{ marginLeft: '8px' }"
                    @click="onCaseDelete(record.key)"
                  />
                </a-tooltip>
              </template>
            </a-table>
          </a-col>
        </a-row>
      </div>
    </a-form-model-item>

    <a-modal
      v-model="isAddCaseModalOpen"
      title="Add case"
      :destroyOnClose="true"
    >
      <template slot="footer">
        <span style="display: flex;justify-content: flex-end">
          <span>
            <a-button key="back" @click="onCloseAddCaseModal">Cancel</a-button>
            <a-button type="primary" @click="onSaveCase">Save</a-button>
          </span>
        </span>
      </template>
      <AddCase
        v-if="isAddCaseModalOpen"
        ref="addcase"
        :dataSource="form.cases"
        :currentEditCase="currentEditCase"
        :validateNumberAndFloat="validateNumberAndFloat"
        :value="getDataForInputManager()"
        :fieldTypes="fieldTypes"
      />
    </a-modal>
  </div>
</template>

<script>
import { Block } from "@/components/bp-editor/block/Block";
import AddCase from "./AddCase";

const changeTypes = {
  "=": 1,
  "+=": 2,
  "-=": 3
};

export default {
  name: "CaseForm",
  components: { AddCase },
  props: {
    block: Block,
    fieldTypes: Object,
    blocks: Array,
    getValueType: Function,
    fields: Array,
    enums: Array,
    form: Object,
    firstVariable: Object,
    validateNumberAndFloat: Function
  },
  data() {
    return {
      columns: [
        {
          title: "Case",
          dataIndex: "case",
          scopedSlots: { customRender: "case" }
        },
        {
          title: "Type",
          dataIndex: "type",
          scopedSlots: { customRender: "type" }
        },
        {
          title: "Action",
          dataIndex: "action",
          align: "center",
          scopedSlots: { customRender: "action" }
        }
      ],
      isAddCaseModalOpen: false,
      currentEditCase: null
    };
  },
  methods: {
    onCaseAddButton() {
      this.isAddCaseModalOpen = true;
    },
    onCloseAddCaseModal() {
      this.isAddCaseModalOpen = false;
      this.currentEditCase = null;
    },
    editCase(editCaseKey) {
      this.currentEditCase = this.form.cases.find(v => v.key === editCaseKey);
      this.isAddCaseModalOpen = true;
    },
    onSaveCase(e) {
      this.$refs.addcase.$children[0].validate(valid => {
        if (valid) {
          this.$emit("addCase", this.$refs.addcase.form);
          this.isAddCaseModalOpen = false;
          this.currentEditCase = null;
        } else {
          return false;
        }
      });
    },
    onCaseDelete(key) {
      this.$emit("onCaseDelete", key);
    },
    getDataForInputManager() {
      return {
        value_type: this.firstVariable.value_type,
        value: this.currentEditCase
          ? this.currentEditCase.case
          : this.firstVariable.value_type === this.fieldTypes.BOOLEAN
            ? "false"
            : this.currentEditCase,
        array_value_type: this.firstVariable.array_value_type,
        enum_values: this.firstVariable.enum_id
          ? this.enums.find(x => x.id === this.firstVariable.enum_id).values
          : this.firstVariable.enum_values,
        input_width:
          this.firstVariable.value_type === this.fieldTypes.ARRAY ? 81 : 100
      };
    },
    getCaseLabel(data) {
      if (
        this.firstVariable.value_type === this.fieldTypes.ARRAY &&
        this.firstVariable.array_value_type === this.fieldTypes.ENUM &&
        data.case
      ) {
        const en = data.case.split(",").map(v => Number(v));
        const firstVariableEnum = this.enums.find(v => v.id === this.firstVariable.enum_id);
        const enum_values = firstVariableEnum ? firstVariableEnum.values : null;
        return en.map(
          v => enum_values.find(d => d.value === v).label
        );
      } else if (
        this.firstVariable.value_type === this.fieldTypes.ENUM &&
        data.case
      ) {
        const firstVariableEnum = this.enums.find(v => v.id === this.firstVariable.enum_id);
        const enum_values = firstVariableEnum ? firstVariableEnum.values : null;
        return enum_values.find(
          v => v.value === Number(data.case)
        ).label;
      } else {
        return data.case;
      }
    }
  }
};
</script>

<style scoped></style>
