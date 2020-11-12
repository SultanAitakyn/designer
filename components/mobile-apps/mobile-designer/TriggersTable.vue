<template>
  <div>
    <a-table
      :columns="columns"
      :dataSource="item.model.actions"
      :key="tableKey"
      :pagination="false"
      size="small"
    >
      <a slot="trigger" slot-scope="record">
        {{ actionTriggers.find(x => x.value === record.trigger).label }}
      </a>
      <span slot="action" slot-scope="record">
        {{ actionTypes.find(x => x.value === record.type) && actionTypes.find(x => x.value === record.type).label }}<br>
        {{ renderByType(record) }}
      </span>
      <a slot="actions" slot-scope="record">
        <a-button-group size="small">
          <a-icon
            type="setting"
            style="margin-left: 12px;"
            @click="editTrigger(record)"
          />
          <a-icon
            type="delete"
            style="color: red; margin-left: 12px"
            @click="deleteTrigger(record)"
          />
        </a-button-group>
      </a>
    </a-table>

    <a-button
      size="small"
      type="primary"
      style="margin-top: 10px;"
      @click="createTrigger()"
    >
      New trigger
    </a-button>

    <component
      :is="modalType"
      :isModal="isModal"
      :editMode="editMode"
      :showResultTriggers="true"
      :item="trigger"
      :screen-type="screenType"
      @saveTrigger="saveTrigger"
      @closeModal="closeModal"
    />

  </div>
</template>

<script>
  import {getMethodForEndpoint, randStr} from "@/utils/common";
  import {actionTypes, actionTriggers, createTriggerTemplate} from "@/utils/mautils";
  import TriggerForm from '@/components/mobile-apps/mobile-designer/TriggerForm';
  import {mapState} from "vuex";


  const columns = [
    {
      title: "Trigger",
      key: "trigger",
      width: 100,
      scopedSlots: {customRender: "trigger"}
    },
    {
      title: "Action and Target",
      key: "action",
      scopedSlots: {customRender: "action"},
      ellipsis: true,
    },
    {
      title: "",
      align: "right",
      width: 70,
      scopedSlots: {customRender: "actions"}
    }
  ];

  export default {
    name: "TriggersTable",

    components: {
      'modal-edit-trigger': TriggerForm
    },

    props: {
      item: Object,
      screenType: Number
    },

    data() {
      return {
        actionTypes, actionTriggers, getMethodForEndpoint, columns,
        isModal: false,
        modalType: '',
        trigger: null,
        editMode: true,
        itemModel: {},
        tableKey: randStr(5),
      };
    },

    computed: {
      ...mapState('mobileDesigner', ['screens'])
    },

    methods: {
      renderByType(r) {
        switch (r.type) {
          case 1:
            if (this.screens.find(x => r.screen && x.model.model.key === r.screen.model.key)) {
              if (this.screens.find(x => x.model.model.key === r.screen.model.key).model.model.navigation.title) {
                return this.screens.find(x => x.model.model.key === r.screen.model.key).model.model.navigation.title;
              } else {
                return '(' + this.screens.find(x => x.model.model.key === r.screen.model.key).name + ')';
              }
            } else {
              return '(!) No screen key';
            }
          case 2:
            return r.endpoint.url;
          case 3:
            return getMethodForEndpoint(r.endpoint.method) + ' ' + r.endpoint.url;
        }
      },

      createTrigger() {
        this.trigger = createTriggerTemplate();
        this.editMode = false;
        this.modalType = 'modal-edit-trigger';
        this.isModal = true;
      },

      editTrigger(t) {
        this.trigger = JSON.parse(JSON.stringify(t));
        this.editMode = true;
        this.modalType = 'modal-edit-trigger';
        this.isModal = true;
      },

      closeModal() {
        this.isModal = false;
        this.trigger = null;
        this.modalType = '';
      },

      saveTrigger(t) {
        if (!this.item.model.actions) {
          this.item.model.actions = []
        }
        let i = this.item.model.actions.findIndex(x => x.key === t.data.key);
        if (i > -1)
          this.item.model.actions[i] = t.data;
        else
          this.item.model.actions.push(t.data);
        this.closeModal();
        this.tableKey = randStr(5);
      },

      deleteTrigger(t) {
        let i = this.item.model.actions.findIndex(x => x.key === t.key);
        if (i > -1) this.item.model.actions.splice(i, 1);
      },
    }
  }
</script>

<style>
  .ant-empty-normal {
    margin: 0 0;
  }

  .ant-empty-normal .ant-empty-image {
    height: 24px;
  }
</style>

<style scoped>
  .m-bottom {
    margin-bottom: 8px;
  }

  .ant-empty-normal {
    margin: 0 0;
  }

  .ant-empty-normal .ant-empty-image {
    height: 24px;
  }
</style>
