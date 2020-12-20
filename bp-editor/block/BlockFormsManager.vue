<template>
  <component
    v-bind:is="currentBlockForm"
    :block="block"
    :businessProcesses="businessProcesses"
    :groupedBusinessP="groupedBusinessP"
    :models="models"
    :enums="enums"
    :fieldTypes="fieldTypes"
    :blocks="blocks"
    :fields="fields"
    :getValueType="getValueType"
    :validateName="validateName"
    :validateNumberAndFloat="validateNumberAndFloat"
    @onBlockFormSubmit="$emit('onBlockFormSubmit', $event)"
  ></component>
</template>

<script>
import { Block, BlockType } from "@/components/bp-editor/block/Block";
import { getFieldTypes } from "@/components/bp-editor/fields/Fields";
import { Modal } from "ant-design-vue";

export default {
  name: "BlockFormsManager",
  props: {
    block: Block,
    businessProcesses: {
      type: Array,
      default: () => []
    },
    models: {
      type: Array,
      default: () => []
    },
    enums: {
      type: Array,
      default: () => []
    },
    groupedBusinessP: Array
  },
  components: {
    CreateVariableForm: () =>
      import("@/components/bp-editor/block/BlockForms/CreateVariableForm"),
    LoopForm: () => import("@/components/bp-editor/block/BlockForms/LoopForm"),
    BusinessProcessForm: () =>
      import("@/components/bp-editor/block/BlockForms/BusinessProcessForm"),
    ConditionForm: () =>
      import("@/components/bp-editor/block/BlockForms/ConditionForm"),
    BpParamsList: () =>
      import("@/components/bp-editor/block/BlockForms/BpParamsList")
  },
  computed: {
    currentBlockForm() {
      return this.getCurrentBlockForm();
    },
    fieldTypes() {
      return getFieldTypes(this.$store.state.fieldValueTypes);
    },
    blocks() {
      return this.schema.getBlocks(
        this.block ? this.block.id : null,
        this.block ? this.block.type : null
      );
    },
    fields() {
      return this.blocks.reduce((v, { fields }) => v.concat(fields), []);
    },
    schema() {
      return this.$store.getters.getSchema;
    },
    allBlocksNames() {
      return this.schema.data.nodes.filter(v => v.id !== this.block.id).map(v => v.name);
    }
  },
  methods: {
    getCurrentBlockForm() {
      switch (this.block ? this.block.type : null) {
        case BlockType.BP:
          return "BusinessProcessForm";
        case BlockType.CREATE_VARIABLE:
          return "CreateVariableForm";
        case BlockType.CHANGE_VARIABLE:
          return "ConditionForm";
        case BlockType.CONDITION:
          return "ConditionForm";
        case BlockType.CYCLE:
          return "LoopForm";
        case BlockType.START:
          return "BpParamsList";
        case BlockType.END:
          return "BpParamsList";
        default:
          return "BusinessProcessForm";
      }
    },
    getValueType(field) {
      if (field.value_type === this.fieldTypes.ARRAY) {
        return (
          "array[" +
          Object.keys(this.fieldTypes)
            .find(key => this.fieldTypes[key] === field.array_value_type)
            .toLowerCase() +
          "]"
        );
      } else {
        return Object.keys(this.fieldTypes)
          .find(key => this.fieldTypes[key] === field.value_type)
          .toLowerCase();
      }
    },
    onBlockDelete(v) {
      Modal.confirm({
        title:
          "Are you sure you want to delete '" + this.block.name + "' block?",
        content: this.deleteBlockContent(this.block.id),
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: () => {
          this.$emit("delete", this.block);
        },
        onCancel() {}
      });
    },
    deleteBlockContent(id) {
      let blocksUsedCurrentBlockField = this.schema.getBlocksUsingCurrentBlockData(
        id
      );
      let blockNames = blocksUsedCurrentBlockField.map(v => v.name);
      if (blocksUsedCurrentBlockField.length) {
        return (
          "Important: " +
          blockNames.map(v => v.toUpperCase()) +
          " - blocks use this block data! This blocks will be reset!"
        );
      } else {
        return "NOTE: Block will be permanently deleted from your scheme and can't be recovered";
      }
    },
    validateName(rule, value, callback) {
      if (value.trim() === "") {
        return callback(new Error('Please input block\'s name!'))
      } else if(this.allBlocksNames.map(v => v.toLowerCase()).includes(value.toLowerCase())) {
        return callback(new Error('Provided name already exists!'));
      }
      callback();
    },
    validateNumberAndFloat(rule, value, callback, type) {
      if (type && value === 'NaN') {
        if (type === this.fieldTypes.FLOAT || type === this.fieldTypes.NUMBER) {
          callback(new Error('Please check entered number'));
        }
      }
      callback();
    }
  }
};
</script>

<style scoped></style>
