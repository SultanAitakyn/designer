<template>
  <a-modal
    v-model="visible"
    :title="edit ? 'Edit screen' : 'Add screen'"
    @cancel="onClose"
  >
    <a-form-model
      name="itemForm"
      :model="itemModel"
      :rules="itemRules"
      :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
      class="screen-form"
    >
      <a-form-model-item prop="name" ref="name" :required="true">
        <template slot="label">
          Name
          <a-tooltip :mouseEnterDelay="1">
            <template slot="title">
              Screen name will help you to find this component in designer interface. Make sure it's descriptive and unique.
            </template>
            <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
          </a-tooltip>
        </template>
        <a-input v-model="itemModel.name"/>
      </a-form-model-item>

      <a-form-model-item label="Title" prop="title" ref="title" help="Title visible in the screen header">
        <a-input v-model="itemModel.model.model.navigation.title"/>
      </a-form-model-item>

      <a-form-model-item
        v-if="itemModel.model.type !== 5"
        prop="endpoint"
        ref="endpoint"
        :validateStatus="!endpointsReady ? 'validating' : ''"
        hasFeedback
      >
        <template slot="label">
          Endpoint
          <a-tooltip :mouseEnterDelay="1">
            <template slot="title">
              The endpoint is a primary data source for your screen. You can bind element properties to the fields of the chosen endpoint.
            </template>
            <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
          </a-tooltip>
        </template>

        <a-select
          showSearch
          allowClear
          placeholder="Select data source"
          v-model="itemModel.model.model.data_endpoint_id"
          optionFilterProp="children"
          :disabled="!endpointsReady"
          @change="changeEndpoint"
        >
          <a-select-opt-group v-for="group in endpointGroups" :key="group.id">
            <span slot="label">
              <a-icon type="api"/>
              {{ group.name }}
            </span>

            <a-select-option
              v-for="endpoint in itemModel.model.type===1
              ? endpoints.filter(x => x.groupId===group.id && x.method===1 && x.fields.find(y=> y.valueType===6))
              : endpoints.filter(x => x.groupId===group.id && x.method===1)"
              :value="endpoint.id"
              :key="endpoint.id"
            >
              {{ group.name }} => {{ getMethodForEndpoint(endpoint.method) }} {{ endpoint.path }}
            </a-select-option>
          </a-select-opt-group>
        </a-select>
      </a-form-model-item>

      <a-form-model-item
        prop="itemModel.model.model.data_field_id" ref="itemModel.model.model.data_field_id"
        v-if="itemModel.model.model.data_endpoint_id && [1,10].includes(itemModel.model.type)"
        :validateStatus="!endpointsReady ? 'validating' : ''"
        hasFeedback
      >
        <template slot="label">
          Endpoint Field (array)
          <a-tooltip :mouseEnterDelay="1">
            <template slot="title">
              To properly render this type of screen you need to pick a right data array from your endpoint. Usually it's named 'data' field.
            </template>
            <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
          </a-tooltip>
        </template>

        <a-select
          showSearch
          placeholder="Select array field"
          v-model="itemModel.model.model.data_field_id"
          optionFilterProp="children"
          :disabled="!endpointsReady"
        >
          <a-select-option
            v-for="field in endpoints.find(x => x.id===itemModel.model.model.data_endpoint_id).fields.filter(y=> y.valueType===6 && y.dir === 2)"
            :value="field.id.toString()"
            :key="field.id"
          >
            {{ field.name }} ({{ field.id }})
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item v-if="itemModel.model.type !== 5" prop="startScreen" ref="startScreen">
        <template slot="label">
          Start screen
          <a-tooltip :mouseEnterDelay="1">
            <template slot="title">
              This is the first screen, that will be shown to the user after application launch. There is the only one start screen can be designated.<br/><b
              style="color: #f56a00"
            >
              {{ isMain ? 'Why disabled? Designate other screen as a start screen.' : '' }}</b>
            </template>
            <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
          </a-tooltip>
        </template>

        <a-switch
          v-model="itemModel.is_main"
          :disabled="isMain"
        >
          <a-icon slot="checkedChildren" type="check"/>
          <a-icon slot="unCheckedChildren" type="close"/>
        </a-switch>
      </a-form-model-item>

      <a-form-model-item
        v-if="itemModel.model.type !== 5"
        label="Background Color"
        prop="background"
        ref="background"
      >
        <ColorSetting v-model="itemModel.model.model.background.color"/>
        <!--<div style="display: flex; justify-content: flex-start">
          <a-select
            style="width: 130px; margin-right: 6px;"
            v-model="itemModel.model.model.background.color.name"
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
              backgroundColor: itemModel.model.model.background.color.name ? app.colors[itemModel.model.model.background.color.name] : itemModel.model.model.background.color.hex,
              width: '45px',
              height: '30px',
              border: '1px solid gray',
              borderRadius: '4px'
            }"
            @click="(showBackgroundColorPicker = true), (showTextColorPicker = false)"
          />
        </div>
        <div class="color-picker" v-if="showBackgroundColorPicker">
          <a-icon
            type="close"
            @click.stop="showBackgroundColorPicker = false"
            style="padding: 5px 0 5px 5px;"
          />
          <chrome-picker
            :value="itemModel.model.model.background.color.name ? app.colors[itemModel.model.model.background.color.name] : itemModel.model.model.background.color.hex"
            @input="changeBackgroundColor"
          />
        </div>-->
      </a-form-model-item>

      <a-form-model-item prop="padding" ref="padding" v-if="[10].includes(itemModel.model.type)">
        <template slot="label">
          Padding
          <a-tooltip>
            <template slot="title">
              Element padding tooltip
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </template>

        <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
          <a-icon type="border-left" style="width: 18px; height: 18px; margin-right: 2px;"/>
          <a-input-number
            v-model.number="itemModel.model.model.config.padding[3]"
            :min="0"
            style="width: 60px;"
          />
        </a-col>
        <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
          <a-icon type="border-top" style="width: 18px; height: 18px; margin-right: 2px; margin-left: 4px;"/>
          <a-input-number
            v-model.number="itemModel.model.model.config.padding[0]"
            :min="0"
            style="width: 60px;"
          >
            <a-icon slot="prefix" type="user"/>
          </a-input-number>
        </a-col>
        <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
          <a-icon type="border-right" style="width: 18px; height: 18px; margin-right: 2px; margin-left: 4px;"/>
          <a-input-number
            v-model.number="itemModel.model.model.config.padding[1]"
            :min="0"
            style="width: 60px;"
          />
        </a-col>
        <a-col :span="6" style="display: flex; justify-content: flex-start; flex-wrap: nowrap; align-items: baseline;">
          <a-icon type="border-bottom" style="width: 18px; height: 18px; margin-right: 2px; margin-left: 4px;"/>
          <a-input-number
            v-model.number="itemModel.model.model.config.padding[2]"
            :min="0"
            style="width: 60px;"
          />
        </a-col>
      </a-form-model-item>

      <a-form-model-item prop="cols" ref="cols" v-if="[10].includes(itemModel.model.type)">
        <template slot="label">
          Elements per line
          <a-tooltip>
            <template slot="title">
              How many elements per row will be rendered
            </template>
            <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
          </a-tooltip>
        </template>

        <a-input-number
          v-model.number="itemModel.model.model.config.width"
          :min="2"
          :max="8"
          style="width: 70px;"
        />
      </a-form-model-item>

      <a-form-model-item
        label="Height ratio"
        prop="height_ratio"
        ref="height_ratio"
        v-if="[10].includes(itemModel.model.type)"
      >
        <a-input-number
          v-model.number="itemModel.model.model.config.height_ratio"
          step="0.1"
          :min="0.1"
          style="width: 70px;"
        />
      </a-form-model-item>

      <a-form-model-item
        label="Column spacing"
        prop="col_spacing"
        ref="col_spacing"
        v-if="[10].includes(itemModel.model.type)"
      >
        <a-input-number
          v-model.number="itemModel.model.model.config.col_spacing"
          :min="0"
          style="width: 70px;"
        />
      </a-form-model-item>

      <a-form-model-item
        label="Rows spacing"
        prop="row_spacing"
        ref="row_spacing"
        v-if="[10].includes(itemModel.model.type)"
      >
        <a-input-number
          v-model.number="itemModel.model.model.config.row_spacing"
          :min="0"
          style="width: 70px;"
        />
      </a-form-model-item>

      <TriggersTable :item="itemModel.model" :screen-type="itemModel.model.type" :key="itemModel.model.key" style="margin-top: 16px;"/>

    </a-form-model>

    <template slot="footer">
      <span style="display: flex;justify-content: space-between">
        <span>
          <a-tooltip placement="bottom">
            <template slot="title">
              Delete this element
            </template>
            <a-button key="delete" type="danger" ghost @click="showDeleteConfirm(element)">
              <a-icon type="delete"/>
            </a-button>
          </a-tooltip>
        </span>
        <span>
          <a-button key="back" @click="onClose">Cancel</a-button>
          <a-button key="submit" type="primary" @click="onSave">Save</a-button>
        </span>
      </span>
    </template>
  </a-modal>
</template>

<script>
  import ColorSetting from "@/components/mobile-apps/mobile-designer/widget-settings/ColorSetting";
  import {mapState} from "vuex";
  import {getMethodForEndpoint} from '@/utils/common';
  import TriggersTable from '@/components/mobile-apps/mobile-designer/TriggersTable';


  export default {
    name: "ScreenForm",

    components: {
      ColorSetting,
      TriggersTable,
    },

    props: {
      element: Object,
      visible: Boolean
    },

    data() {
      return {
        getMethodForEndpoint,
        isMain: false,
        edit: false,
        columnsModal: {
          visible: false,
        },
        showBackgroundColorPicker: false,
        itemModel: {},
        itemRules: {
          "name": [
            {"required": true, "message": 'Component ID required', "trigger": 'change'},
            {"min": 2, "max": 50, "message": 'Component ID is 2 chars minimum', "trigger": 'change'},
          ],
        },
        elementModal: {
          visible: false,
          modal: '',
        },
      }
    },

    computed: {
      ...mapState(['endpoints', 'endpointGroups', 'endpointsReady']),
      ...mapState('mobileDesigner', ['app']),

      colorSchemeParams() {
        return Object.keys(this.app.colors).map(key => {
          return {
            name: key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
            hex: this.app.colors[key]
          }
        });
      },
    },

    created() {
      if (this.element) {
        //Load data with no reactivity
        this.itemModel = JSON.parse(JSON.stringify(this.element));
        // if (this.itemModel.data['getList'].endpointId===0) this.itemModel.data['getList'].endpointId=undefined;
        this.edit = true;
        //Make some adjustments
        if (!this.itemModel.model.model.background)
          this.itemModel.model.model.background = {color: {hex: '#ffffff'}};

        if (this.itemModel.is_main) this.isMain = true;
      }
    },

    methods: {

      changeEndpoint(value) {
        if (this.itemModel.model.type === 1)
          this.itemModel.model.model.data_field_id = this.endpoints.find(x => x.id === value).fields.find(y => y.valueType === 6).id.toString();
      },

      changeBackgroundColor(val) {
        this.itemModel.model.model.background.color.hex = val.hex;
        this.itemModel.model.model.background.color.name = undefined;
      },

      showDeleteConfirm() {
        this.$emit('del', this.itemModel);
      },

      onClose() {
        this.$emit('elementModalClose');
        return false;
      },

      onSave() {
        //Convert back to integer
        // if (!this.itemModel.data['getList'].endpointId) this.itemModel.data['getList'].endpointId=0;
        this.$emit('save', this.itemModel);
        //What need to update?
        //this.onClose();
      },
    },
  }
</script>

<style scoped>
  .screen-form .ant-form-item {
    margin-bottom: 8px;
  }

  .icon-wrapper {
    position: relative;
    padding: 0px 30px;
  }

  .icon-wrapper .anticon {
    position: absolute;
    top: -2px;
    width: 16px;
    height: 16px;
    line-height: 1;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.25);
  }

  .icon-wrapper .anticon:first-child {
    left: 0;
  }

  .icon-wrapper .anticon:last-child {
    right: 0;
  }
</style>
