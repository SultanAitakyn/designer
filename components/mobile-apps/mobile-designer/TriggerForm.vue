<template>
  <div>
    <a-modal
      :title="editMode ? 'Edit trigger' : 'New trigger'"
      v-model="visible"
      :okText="editMode ? 'Save' : 'Create'"
      @ok="saveTriggerAndClose"
      @cancel="$emit('closeModal')"
      :destroyOnClose="true"
    >
      <a-form-model
        name="triggerForm" v-if="itemModel"
        ref="triggerForm"
        :model="itemModel"
        :rules="itemRules"
        :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
      >

        <!-- Trigger Select (not default trigger) -->
        <a-form-model-item ref="trigger" prop="trigger" v-if="!defaultTrigger" :wrapper-col="{ span: 16 }">
          <template slot="label">
            Trigger
            <a-tooltip :mouseEnterDelay="1">
              <template slot="title">
                User event, that triggers attached actions.
              </template>
              <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
            </a-tooltip>
          </template>

          <a-select
            :default-value="0"
            size="small"
            placeholder="Select trigger"
            v-model="itemModel.trigger"
          >
            <a-select-option
              v-for="t in availableTriggers"
              :key="t.value"
              :value="t.value"
            >
              <a-tooltip :mouseEnterDelay="0.5" placement="left">
                <template slot="title">
                  {{ t.description }}
                </template>
                {{ t.label }}
              </a-tooltip>
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <!-- Action Type Radio Button -->
        <a-form-model-item
          ref="type"
          prop="type"
          v-if="screenType || (selectedElem && selectedElem.type !== 9)"
        >
          <template slot="label">
            Action Type
            <a-tooltip :mouseEnterDelay="1">
              <template slot="title">
                Type of action, that will be executed on user event.
              </template>
              <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
            </a-tooltip>
          </template>

          <a-radio-group
            :default-value="0"
            size="small"
            button-style="solid"
            @change="typeChange"
            placeholder="Select action type"
            v-model="itemModel.type"
          >
            <a-radio-button
              v-for="a in actionTypes"
              :key="a.value"
              :value="a.value"
            >
              <a-tooltip :mouseEnterDelay="0.5">
                <template slot="title">
                  {{ a.description }}
                </template>
                {{ a.label }}
              </a-tooltip>
            </a-radio-button>
          </a-radio-group>
        </a-form-model-item>

        <!-- Target Screen Select (navigate type) -->
        <a-form-model-item
          ref="screen"
          prop="screen.model.key"
          v-if="itemModel.type===1"
          :wrapper-col="{ span: 16 }"
          :rules="itemRules.key"
        >
          <template slot="label">
            Target Screen
            <a-tooltip :mouseEnterDelay="1">
              <template slot="title">
                Screen, that user will be navigated to
              </template>
              <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
            </a-tooltip>
          </template>

          <a-select
            :default-value="0"
            size="small"
            placeholder="Select trigger"
            @change="changeScreen"
            v-model="itemModel.screen.model.key"
          >
            <a-select-option
              v-for="s in screens"
              :key="s.model.model.key"
              :value="s.model.model.key"
            >
              <a-icon
                :type="screenTypes.find(x=> x.enum_id===s.model.type).icon"
                v-if="screenTypes.find(x=> x.enum_id===s.model.type)"
              />
              {{ s.model.model.navigation.title ? s.model.model.navigation.title : '(' + s.name + ')' }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <!-- Local Action Select (device action type) -->
        <a-form-model-item
          ref="endpoint"
          prop="endpoint.url"
          :wrapper-col="{ span: 16 }"
          v-if="itemModel.type===2"
          :rules="itemRules.url"
        >
          <template slot="label">
            Local Action
            <a-tooltip :mouseEnterDelay="1">
              <template slot="title">
                Local actions executed by device
              </template>
              <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
            </a-tooltip>
          </template>

          <a-select
            size="small"
            option-filter-prop="children"
            show-search
            placeholder="Select action"
            @change="selectLocalAction"
            v-model="itemModel.endpoint.url"
          >
            <a-select-opt-group v-for="g in localActionGroups" :key="g.name">
              <span slot="label">
                <a-icon :type="g.icon" v-if="g.icon"/>
                {{ g.label }}
              </span>

              <a-select-option
                v-for="la in localActions.filter(x=> x.group===g.name)"
                :key="la.endpoint"
                :value="la.endpoint"
              >
                <a-tooltip :mouseEnterDelay="0.5" placement="left">
                  <template slot="title">
                    {{ la.description }}
                  </template>
                  {{ la.label }}
                </a-tooltip>
              </a-select-option>
            </a-select-opt-group>
          </a-select>
        </a-form-model-item>

        <!-- Target Select (device action type) -->
        <a-form-model-item
          label="Target"
          ref="screen"
          prop="screen.model.key"
          :wrapper-col="{ span: 16 }"
          v-if="itemModel.type===2"
        >
          <a-tree-select
            v-model="itemModel.target"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="Please select"
            allow-clear
            tree-default-expand-all
            size="small"
          >
            <a-tree-select-node
              v-for="s in screens"
              :key="s.model.model.key"
              :value="s.model.model.key"
              :title="s.model.model.navigation.title ? s.model.model.navigation.title : '('+s.name+')'"
            >
              <template v-if="s.model.model.children && s.model.model.children.find(c => c.model.isRootStack || c.model.name === 'root-stack')">
                <a-tree-select-node
                  v-for="w in s.model.model.children.find(c => c.model.isRootStack || c.model.name === 'root-stack').model.children"
                  :key="w.model.key"
                  :value="w.model.key"
                  :title="w.model.name"
                />
              </template>
            </a-tree-select-node>
          </a-tree-select>
        </a-form-model-item>

        <!-- Endpoint Select (endpoint type) -->
        <a-form-model-item
          ref="endpoint"
          prop="endpoint.id"
          :wrapper-col="{ span: 16 }"
          v-if="itemModel.type===3"
          :rules="itemRules.id"
        >
          <template slot="label">
            Endpoint
            <a-tooltip :mouseEnterDelay="1">
              <template slot="title">
                Description for endpoint (!)
              </template>
              <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
            </a-tooltip>
          </template>

          <a-select
            size="small"
            option-filter-prop="children"
            show-search
            placeholder="Select action"
            @change="selectEndpoint"
            v-model="itemModel.endpoint.id"
          >
            <a-select-opt-group v-for="group in endpointGroups" :key="group.id">
              <span slot="label">
                <a-icon type="api"/>
                {{ group.name }}
              </span>
              <a-select-option
                v-for="endpoint in endpoints.filter(x => x.groupId===group.id)"
                :value="endpoint.id"
                :key="endpoint.id"
              >
                {{ group.name }} => {{ getMethodForEndpoint(endpoint.method) }} {{ endpoint.path }}
              </a-select-option>
            </a-select-opt-group>
          </a-select>
        </a-form-model-item>

        <!-- Icon Select (screen action) -->
        <a-form-model-item
          label="Icon"
          ref="icon"
          prop="icon"
          v-if="screenType"
        >
          <a-select style="width: 180px" size="small" v-model="itemModel.icon.name">
            <a-select-option v-for="icon in mobIcons" :key="icon.value" :value="icon.value">
              <a-icon :type="icon.label"/>
              {{ icon.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <!-- Icon Color Picker (screen action) -->
        <a-form-model-item
          label="Icon Color"
          :wrapper-col="{ span: 16 }"
          prop="textColor"
          ref="textColor"
          v-if="screenType"
        >
          <div style="display: flex; justify-content: flex-start;align-items: center;">
            <a-select
              style="width: 130px; margin-right: 6px;"
              size="small"
              v-model="itemModel.icon.color.name"
              placeholder="Custom color"
            >
              <a-select-option v-for="param in colorSchemeParams" :key="param.name" :value="param.name">
                <span
                  style=" display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: solid 1px rgba(0,0,0,.25);"
                  :style="{backgroundColor: param.hex}"
                />
                {{ param.label }}
              </a-select-option>
            </a-select>
            <div
              :style="{
                backgroundColor: itemModel.icon.color.name ? app.colors[itemModel.icon.color.name] : itemModel.icon.color.hex,
                width: '45px',
                height: '24px',
                border: '1px solid gray',
                borderRadius: '4px'
              }"
              @click="(showIconColorPicker = true)"
            />
            <div class="color-picker" v-if="showIconColorPicker">
              <a-icon
                type="close"
                @click.stop="showIconColorPicker = false"
                style="padding: 5px 0 5px 5px;"
              />
              <chrome-picker
                :value="itemModel.icon.color.name ? app.colors[itemModel.icon.color.name] : itemModel.icon.color.hex"
                @input="changeIconColor"
              />
            </div>
          </div>
        </a-form-model-item>

        <!-- Float Switch (screen action and main action) -->
        <a-form-model-item
          label="Float left"
          ref="float_left"
          prop="float_left"
          v-if="screenType && itemModel.trigger === 11"
        >
          <a-switch v-model="itemModel.float_left"/>
        </a-form-model-item>

        <!-- Label Input (screen action and menu action) -->
        <a-form-model-item label="Label" ref="label" prop="label" v-if="itemModel.trigger === 10">
          <a-input v-model="itemModel.label"/>
        </a-form-model-item>

      </a-form-model>

      <a-tabs
        :animated="false"
        v-if="itemModel.type > 0 || (!screenType && selectedElem && selectedElem.type === 9)"
      >
        <a-tab-pane key="1">
          <span slot="tab">
            <a-icon type="tool"/>
            Params
          </span>
          <a-table
            :columns="columnsParams"
            :dataSource="itemModel.endpoint && itemModel.endpoint.params"
            :key="tableKeyParams"
            :pagination="false"
            size="small"
          >
            <span slot="title" style="display: flex; justify-content: space-between; align-items: center;">
              <a-tooltip placement="left">
                <template slot="title">
                  This params will be passed to target component on trigger execution
                </template>
                <a-tag color="#87d068"> Params</a-tag>
              </a-tooltip>

              <a-tooltip v-if="itemModel.type>0 && !(itemModel.type===2)">
                <template slot="title">
                  Add param
                </template>

                <a>
                  <a-icon
                    type="plus-circle"
                    @click="createParam()"
                  />
                </a>
              </a-tooltip>

            </span>
            <span slot="param" slot-scope="record">
              {{ renderParamTargetByType(record) }}<br>
            </span>
            <span slot="value" slot-scope="record">
              {{ renderParamValueByType(record) }}
            </span>
            <a slot="actions" slot-scope="record">
              <a-button-group size="small">
                <a-icon
                  type="setting"
                  style="margin-left: 12px;"
                  @click="editParam(record)"
                />
                <a-icon
                  v-if="!(itemModel.type===2)"
                  type="delete"
                  style="color: red; margin-left: 12px"
                  @click="deleteParam(record)"
                />
              </a-button-group>
            </a>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="2">
          <span slot="tab">
            <a-icon type="thunderbolt"/>
            onSuccess
          </span>
          <a-table
            :columns="columns"
            :dataSource="itemModel.success_actions"
            :key="tableKeyOnSuccess"
            :pagination="false"
            size="small"
          >
            <span slot="title" style="display: flex; justify-content: space-between; align-items: center;">
              <a-tooltip placement="left">
                <template slot="title">
                  This is a chained trigger. It will be executed after successfully executed main trigger
                </template>
                <a-tag color="#108ee9"> onSuccess</a-tag>
              </a-tooltip>
              <a-tooltip>
                <template slot="title">
                  Add action to this trigger
                </template>
                <a>
                  <a-icon
                    type="plus-circle"
                    @click="createTrigger('onSuccess')"
                  />
                </a>
              </a-tooltip>
            </span>
            <span slot="action" slot-scope="record">
              {{ actionTypes.find(x => x.value === record.type).label }}<br>
            </span>
            <span slot="target" slot-scope="record">
              {{ renderTargetByType(record) }}
            </span>
            <a slot="actions" slot-scope="record">
              <a-button-group size="small">
                <a-icon
                  type="setting"
                  style="margin-left: 12px;"
                  @click="editTrigger('onSuccess', record)"
                />
                <a-icon
                  type="delete"
                  style="color: red; margin-left: 12px"
                  @click="deleteTrigger('onSuccess', record)"
                />
              </a-button-group>
            </a>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="3">
          <span slot="tab">
            <a-icon type="thunderbolt"/>
            onError
          </span>
          <a-table
            :columns="columns"
            :dataSource="itemModel.error_actions"
            :key="tableKeyOnError"
            :pagination="false"
            size="small"
          >
            <span slot="title" style="display: flex; justify-content: space-between; align-items: center;">
              <a-tooltip placement="left">
                <template slot="title">
                  This is a chained trigger. It will be executed if main trigger failed to execute
                </template>
                <a-tag color="#108ee9"> onError</a-tag>
              </a-tooltip>
              <a-tooltip>
                <template slot="title">
                  Add action to this trigger
                </template>
                <a>
                  <a-icon
                    type="plus-circle"
                    @click="createTrigger('onError')"
                  />
                </a>
              </a-tooltip>
            </span>
            <span slot="action" slot-scope="record">
              {{ actionTypes.find(x => x.value === record.type).label }}<br>
            </span>
            <span slot="target" slot-scope="record">
              {{ renderTargetByType(record) }}
            </span>

            <a slot="actions" slot-scope="record">
              <a-button-group size="small">
                <a-icon
                  type="setting"
                  style="margin-left: 12px;"
                  @click="editTrigger('onError',record)"
                />
                <a-icon
                  type="delete"
                  style="color: red; margin-left: 12px"
                  @click="deleteTrigger('onError', record)"
                />
              </a-button-group>
            </a>
          </a-table>
        </a-tab-pane>
      </a-tabs>

    </a-modal>

    <component
      :is="modalParam"
      v-if="isParamModal"
      :isModal="isParamModal"
      :editMode="paramEditMode"
      :paramMode="pmode"
      :correctParamMode="itemModel.type"
      :triggerType="itemModel.endpoint.url"
      :target="targetEp"
      :item="param"
      @saveParam="saveParam"
      @closeParamModal="closeParamModal"
    />

    <component
      :is="modalType"
      :isModal="isSecondaryModal"
      :editMode="secondaryEditMode"
      :showResultTriggers="true"
      :defaultTrigger="true"
      :item="trigger"
      :triggerTargetList="ttl"
      @saveTrigger="saveTrigger"
      @closeModal="closeModal"
    />
  </div>
</template>

<script>
  import {Chrome} from "vue-color";
  import ParamForm from '@/components/mobile-apps/mobile-designer/ParamForm';
  import {getMethodForEndpoint, randStr, getFieldFromEndpointsById} from "@/utils/common";
  import {
    actionTypes,
    actionTriggers,
    screenTypes,
    localActionGroups,
    localActions,
    createTriggerTemplate,
    createParamTemplate,
    widgetTypes, mobIcons,
  } from "@/utils/mautils";
  import TriggersTable from '@/components/mobile-apps/mobile-designer/TriggersTable';
  import {mapGetters, mapState} from "vuex";


  const columns = [
    {
      title: "Action",
      key: "action",
      scopedSlots: {customRender: "action"},
      ellipsis: true,
    },
    {
      title: "Target",
      key: "target",
      scopedSlots: {customRender: "target"},
    },
    {
      title: "",
      align: "right",
      width: 70,
      scopedSlots: {customRender: "actions"},
    },
  ];

  const columnsParams = [
    {
      title: "Param",
      key: "param",
      scopedSlots: {customRender: "param"},
      ellipsis: true,
    },
    {
      title: "Value/Variable",
      key: "value",
      scopedSlots: {customRender: "value"},
    },
    {
      title: "",
      align: "right",
      width: 70,
      scopedSlots: {customRender: "actions"},
    },
  ];

  export default {
    name: "TriggerForm",

    components: {
      TriggersTable,
      'modal-edit-param': ParamForm,
      "chrome-picker": Chrome,
    },

    props: {
      item: Object,
      isModal: Boolean,
      editMode: Boolean,
      triggerTargetList: String,
      defaultTrigger: Boolean,
      showResultTriggers: Boolean,
      showNestedTrigger: Boolean,
      screenType: Number,
    },

    data() {
      return {
        showIconColorPicker: false,
        actionTypes,
        actionTriggers,
        localActions,
        getMethodForEndpoint,
        screenTypes,
        localActionGroups,
        mobIcons,
        columns,
        columnsParams,
        widgetTypes,
        trigger: null,
        param: null,
        isSecondaryModal: false,
        isParamModal: false,
        pmode: 0, //Param modal mode (screen|local_action|endpoint)
        ttl: '', //Modal target trigger list (onError or onSuccess)
        targetEp: '', //Target ENDPOINT or SCREENKEY
        secondaryEditMode: false,
        paramEditMode: false, //ParamEditMode - edit or new
        modalType: '',
        modalParam: '',
        itemModel: {},
        tableKeyParams: randStr(5),
        tableKeyOnSuccess: randStr(5),
        tableKeyOnError: randStr(5),
        itemRules: {
          trigger: [{required: true, message: "Trigger required", trigger: 'change'}],
          type: [{required: true, message: "Type required", trigger: 'change'}],
          key: [{required: true, message: "Target screen required", trigger: 'change'}],
          id: [{required: true, message: "Endpoint required", trigger: 'change'}],
          url: [{required: true, message: "Device Action required", trigger: 'change'}],
        },
      };
    },

    computed: {
      ...mapState(['endpoints', 'endpointGroups']),
      ...mapState('mobileDesigner', ['app', 'screens', 'selectedElem']),
      ...mapGetters('mobileDesigner', ['getSelectedScreen']),

      colorSchemeParams() {
        return Object.keys(this.app.colors).map(key => {
          return {
            name: key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
            hex: this.app.colors[key],
          }
        });
      },

      availableTriggers() {
        if (this.screenType) {
          return actionTriggers
        } else {
          return actionTriggers.filter(f => widgetTypes.find(x => x.enum_id === this.selectedElem.type).triggers.includes(f.value))
        }
      },

      visible: {
        get() {
          return this.isModal;
        },
        set(v) {
          if (!v) this.$emit('closeModal');
        },
      },
    },

    created() {
      this.itemModel = JSON.parse(JSON.stringify(this.item));
    },

    methods: {
      changeIconColor(val) {
        this.itemModel.icon.color.hex = val.hex;
        this.itemModel.icon.color.name = undefined;
      },

      changeScreen(v) {
        if (v) {
          this.itemModel.screen.type = this.screens.find(x => x.model.model.key === v).model.type;
          this.itemModel.endpoint.params = [];
        }
      },

      saveTriggerAndClose(e) {
        this.$refs.triggerForm.validate(valid => {
          if (valid) {
            this.$emit('saveTrigger', {data: this.itemModel, type: this.triggerTargetList})
          }
        });
      },

      selectEndpoint(e) {
        this.itemModel.endpoint.url = this.endpoints.find(x => x.id === e).path;
        this.itemModel.endpoint.method = this.endpoints.find(x => x.id === e).method;
        this.itemModel.endpoint.params = [];
      },

      selectLocalAction(e) {
        this.itemModel.endpoint.url = e;
        this.itemModel.endpoint.params = [];
        let paramsTemplate = localActions.find(la => la.endpoint === this.itemModel.endpoint.url).params;
        for (let i = 0; i < paramsTemplate.length; i += 1) {
          this.itemModel.endpoint.params.push({param: paramsTemplate[i].name, value: paramsTemplate[i].defaultValue});
        }
      },

      typeChange(v) {
        switch (v.target.value) {
          case 1:
            this.itemModel.screen = {model: {key: null}, type: null};
            this.itemModel.target = this.getSelectedScreen.id
            break;
          case 2:
            this.itemModel.screen = {model: {key: null}, type: null};
            // this.itemModel.screen=null;
            break;
          case 3:
            this.itemModel.screen = null;
            this.itemModel.target = this.getSelectedScreen.id
            break;
        }
        this.itemModel.endpoint = {url: '', method: 0, id: null, params: []};
        this.$refs.triggerForm.clearValidate();
      },

      renderParamTargetByType(p) {
        switch (this.itemModel.type) {
          case 1:
            return getFieldFromEndpointsById(this.endpoints, p.target_field_id).name;
          case 2:
            return localActions.find(la => la.endpoint === this.itemModel.endpoint.url).params.find(prm => prm.name === p.param).label;
          case 3:
            return getFieldFromEndpointsById(this.endpoints, p.target_field_id).name;
        }
      },

      renderParamValueByType(p) {
        switch (this.itemModel.type) {
          case 1:
            return getFieldFromEndpointsById(this.endpoints, p.source_field_id).name;
          case 2:
            return p.value + ' ' + localActions.find(la => la.endpoint === this.itemModel.endpoint.url).params.find(prm => prm.name === p.param).unit;
          case 3:
            return getFieldFromEndpointsById(this.endpoints, p.source_field_id).name;
        }
      },

      renderTargetByType(r) {
        switch (r.type) {
          case 1:
            return this.screens.find(x => x.model.model.key === r.screen.model.key)
              ? (this.screens.find(x => x.model.model.key === r.screen.model.key).model.model.navigation.title
                ? this.screens.find(x => x.model.model.key === r.screen.model.key).model.model.navigation.title
                : '(' + this.screens.find(x => x.model.model.key === r.screen.model.key).name + ')')
              : '';

          case 2:
            return r.endpoint.url;

          case 3:
            return getMethodForEndpoint(r.endpoint.method) + ' ' + r.endpoint.url;
        }
      },

      createTrigger(d) {
        this.trigger = createTriggerTemplate();
        this.ttl = d;
        this.trigger.trigger = 0;
        this.secondaryEditMode = false;
        this.modalType = 'TriggerForm';
        this.isSecondaryModal = true;
      },

      editTrigger(lst, t) {
        this.trigger = JSON.parse(JSON.stringify(t));
        this.ttl = lst;
        this.secondaryEditMode = true;
        this.modalType = 'TriggerForm';
        this.isSecondaryModal = true;
      },

      closeModal() {
        this.isSecondaryModal = false;
        this.ttl = '',
          this.trigger = null;
        this.modalType = '';
      },

      saveTrigger(t) {
        //save changes
        let trList = t.type === 'onSuccess' ? this.itemModel.success_actions : this.itemModel.error_actions;

        let i = trList ? trList.findIndex(x => x.key === t.data.key) : -1;
        if (i > -1)
          trList[i] = t.data;
        else
          trList.push(t.data);
        this.closeModal();
        this.tableKeyOnSuccess = randStr(5);
      },

      deleteTrigger(lst, t) {
        let trList = lst === 'onSuccess' ? this.itemModel.success_actions : this.itemModel.error_actions;
        let i = trList.findIndex(x => x.key === t.key);
        if (i > -1) trList.splice(i, 1);
      },

      /* PARAMS */
      createParam() {
        this.$refs.triggerForm.validate(valid => {
          if (valid) {
            switch (this.itemModel.type) {
              case 1:
                this.pmode = this.itemModel.type;
                this.targetEp = this.itemModel.screen.model.key;
                break;

              case 2:
                this.pmode = this.itemModel.type;
                this.targetEp = this.itemModel.endpoint.url;
                break;

              case 3:
                this.pmode = this.itemModel.type;
                this.targetEp = this.itemModel.endpoint.id;
                break;
            }
            this.param = createParamTemplate();
            this.paramEditMode = false;
            this.modalParam = 'modal-edit-param';
            this.isParamModal = true;
          }
        });
      },

      editParam(p) {
        this.param = JSON.parse(JSON.stringify(p));
        this.paramEditMode = true;
        this.modalParam = 'modal-edit-param';
        this.isParamModal = true;
      },

      saveParam(p) {
        //save changes
        if (!this.itemModel.endpoint.params) {
          this.itemModel.endpoint.params = []
        }
        let i = this.itemModel.endpoint.params.findIndex(x => x.key === p.key);
        if (i > -1)
          this.itemModel.endpoint.params[i] = p;
        else
          this.itemModel.endpoint.params.push(p);
        this.closeParamModal();
        this.tableKeyParams = randStr(5);
      },

      deleteParam(p) {
        let i = this.itemModel.endpoint.params.findIndex(x => x.key === p.key);
        if (i > -1) this.itemModel.endpoint.params.splice(i, 1);
      },

      closeParamModal() {
        this.isParamModal = false;
        this.param = null;
        this.modalParam = '';
      },

    },
  }
</script>

<style scoped>
  .color-picker {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    height: fit-content;
    width: fit-content;
    position: absolute;
    margin-top: -27px;
    z-index: 500;
  }
</style>
