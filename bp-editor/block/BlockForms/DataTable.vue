<template>
  <a-config-provider>
    <template v-slot:renderEmpty>
      <a-empty>
        <span slot="description">No selected fields</span>
      </a-empty>
    </template>
    <a-table
      :data-source="dataSource"
      :pagination="false"
      :columns="columns"
      size="small"
      ref="table"
      :rowKey="record => record.inputField.id"
    >
      <!-- rows -->
      <template slot="input" slot-scope="inputField">
        {{ inputField.name }}
      </template>
      <template slot="type" slot-scope="text, record">
        {{ getValueType(record.inputField) }}
      </template>
      <template slot="value" slot-scope="text, record">
        <div class="column-value">{{ getConnectedFieldName(record) }}</div>
        <a-tag v-if="record.connectedField === undefined" color="orange">
          Not specified
        </a-tag>
      </template>
      <template slot="actions" slot-scope="row">
        <a-tooltip>
          <template slot="title">
            Edit row
          </template>
          <a-icon
            type="setting"
            :style="{ marginLeft: '8px' }"
            @click="editRow(row)"
          />
        </a-tooltip>
        <a-tooltip>
          <template slot="title">
            Delete this row
          </template>
          <a-icon
            type="delete"
            style="color: red;"
            :style="{ marginLeft: '8px' }"
            @click="deleteRow(row)"
          />
        </a-tooltip>
      </template>
      <!-- /rows -->
    </a-table>
  </a-config-provider>
</template>

<script>
const columns = [
  {
    title: "Input field",
    dataIndex: "inputField",
    scopedSlots: {customRender: "input"}
  },
  {
    title: "Type",
    dataIndex: "type",
    scopedSlots: {customRender: "type"}
  },
  {
    title: "Variable/Value",
    dataIndex: "value",
    scopedSlots: {customRender: "value"}
  },
  {
    title: "Action",
    width: "96px",
    align: "right",
    scopedSlots: {customRender: "actions"}
  }
];

export default {
  name: "DataTable",
  props: {
    dataSource: {
      type: Array,
      default: () => [],
      validator(v) {
        return Array.isArray(v);
      }
    },
    getValueType: Function,
    fields: Array,
    fieldTypes: Object
  },
  data() {
    return {
      columns
    };
  },
  computed: {},
  methods: {
    editRow(data) {
      this.$emit("editRow", data);
    },
    deleteRow(data) {
      this.$emit("deleteRow", data);
    },
    getConnectedFieldName(data) {
      const connectedField = this.fields.find(
        v => v.id === data.connectedField
      );
      if (
        data.inputField.value_type === this.fieldTypes.ARRAY &&
        data.inputField.array_value_type === this.fieldTypes.ENUM &&
        data.connectedField && !connectedField
      ) {
        const enums = data.connectedField.split(",").map(v => Number(v));
        return enums.map(
          v => data.inputField.enum_values.find(d => d.value === v).label
        );
      } else if (
        data.inputField.value_type === this.fieldTypes.ENUM &&
        data.connectedField
      ) {
        return data.inputField.enum_values.find(
          v => v.value === Number(data.connectedField)
        ).label;
      } else {
        return connectedField ? connectedField.name : data.connectedField;
      }
    }
  }
};
</script>

<style scoped>
.column-value {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
