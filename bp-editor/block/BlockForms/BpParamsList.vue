<template>
  <div>
    <a-list
      size="small"
      bordered
      itemLayout="horizontal"
      :dataSource="currentBlockFields"
    >
      <a-list-item slot="renderItem" slot-scope="field">
        <a-list-item-meta :description="getValueType(field)">
          <a slot="title"
            ><span @click="openParamsModal(field)">
              <a-icon type="edit" />
              {{ field.name }}
            </span></a
          >
        </a-list-item-meta>
        <a-icon
          type="delete"
          style="color: red;"
          @click="onDeleteParams(field)"
        />
      </a-list-item>
    </a-list>
    <a-button
      type="dashed"
      style="width: 60%; margin-top: 16px"
      @click="openParamsModal(null)"
    >
      <a-icon type="plus" /> Add parameter
    </a-button>
    <a-modal
      :title="paramsModalTitle"
      v-model="isParamsModalOpen"
      :destroyOnClose="true"
    >
      <template slot="footer">
        <a-row type="flex" justify="end">
          <a-col>
            <a-button key="back" @click="close">Cancel</a-button>
            <a-button type="primary" @click="onModalParamSave">Save</a-button>
          </a-col>
        </a-row>
      </template>
      <BpParams
        ref="addParam"
        @close="close"
        :block="JSON.parse(JSON.stringify(block))"
        :fieldTypes="fieldTypes"
        :blocks="blocks"
        :types="types"
        :field="field"
        :arrayOfType="arrayOfType"
        :isParamsModalOpen="isParamsModalOpen"
        @openModal="isParamsModalOpen = $event"
        @submit="onAddParams"
        @update="onUpdateParams"
        :getValueType="getValueType"
        :models="models"
        :enums="enums"
        :selectedModelId="selectedModelId"
        :selectedEnumId="selectedEnumId"
      />
    </a-modal>
  </div>
</template>

<script>
import BpParams from "./BpParams";
import {BlockType} from "../Block";

export default {
  name: "BpParamsList",
  props: {
    block: Object,
    fieldTypes: Object,
    blocks: Array,
    getValueType: Function,
    models: Array,
    enums: Array,
  },
  data() {
    return {
      isParamsModalOpen: false,
      field: null,
      types: BlockType
    };
  },
  components: {
    BpParams
  },
  computed: {
    currentBlockFields() {
      return this.block.fields ? this.block.fields : [];
    },
    paramsModalTitle() {
      return this.field ? "Edit parameter" : "Add parameter";
    },
    selectedModelId() {
      return this.block.fields && this.block.fields.length ? this.block.fields[0].model_id : undefined;
    },
    selectedEnumId() {
      return this.block.fields && this.block.fields.length ? this.block.fields[0].enum_id : undefined;
    },
    arrayOfType() {
      return this.block.fields && this.block.fields.length
        ? this.block.fields[0].array_value_type
        : this.fieldTypes.NUMBER;
    }
  },
  methods: {
    onModalParamSave() {
      this.$refs.addParam.form.validateFields((err, values) => {
        if (!err) {
          this.$refs.addParam.onFormSubmit(values);
          this.close();
        }
      });
    },
    onAddParams(data) {
      this.block.fields = this.block.fields || [];
      this.block.fields.push(data.field);
      if (data.boundValue) {
        this.block.field_links = this.block.field_links || [];
        this.block.field_links.push(data.boundValue);
      }
    },
    onUpdateParams(data) {
      const index = this.block.fields.findIndex(v => v.id === data.field.id);
      this.$set(this.block.fields, index, data.field);
      if (data.boundValue) {
        this.$set(this.block.field_links, index, data.boundValue);
      }
    },
    onDeleteParams(field) {
      const fieldIndex = this.block.fields.findIndex(v => v.id === field.id);
      this.$delete(this.block.fields, fieldIndex);
      if (this.block.field_links) {
        const fieldLinkIndex = this.block.field_links.findIndex(
          v => v.to_field_id === field.id
        );
        this.$delete(this.block.field_links, fieldLinkIndex);
      }
    },
    openParamsModal(field) {
      this.field = field;
      this.isParamsModalOpen = true;
    },
    close() {
      this.isParamsModalOpen = false;
    }
  }
};
</script>
