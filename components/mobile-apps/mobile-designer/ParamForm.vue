<template>
  <a-modal
    :title="editMode ? 'Edit param' : 'New param'"
    v-model="visible"
    :okText="editMode ? 'Save' : 'Create'"
    @ok="saveTriggerAndClose"
    @cancel="$emit('closeParamModal')"
    :destroyOnClose="true"
  >
    <a-form-model
      v-if="itemModel"
      ref="paramForm"
      :model="itemModel"
      :rules="itemRules"
      :hideRequiredMark="true"
      layout="vertical"
    >
      <a-row :gutter="16">
        <a-col :span="12">

          <!-- Param Select from target fields (navigate type) -->
          <a-form-model-item
            v-if="correctParamMode !== 2"
            prop="target_field_id"
            :rules="itemRules.target_field_id"
            style="margin-top: 3px;"
          >
            <template slot="label">
              Param
              <a-tooltip :mouseEnterDelay="1">
                <template slot="title">
                  Parameter from target screen endpoint
                </template>
                <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
              </a-tooltip>
            </template>

            <a-select
              :default-value="0"
              size="small"
              placeholder="Select target field"
              v-model="itemModel.target_field_id"
            >
              <a-select-option
                v-for="t in target_fields"
                :key="t.id"
                :value="t.id"
              >
                {{ t.name }}
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <!-- Param Select from local actions (device action type) -->
          <a-form-model-item
            v-if="correctParamMode === 2"
            prop="target_field_id"
            :rules="itemRules.target_field_id"
            style="margin-top: 3px;"
          >
            <template slot="label">
              Param
              <a-tooltip :mouseEnterDelay="1">
                <template slot="title">
                  Parameter from target screen endpoint
                </template>
                <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
              </a-tooltip>
            </template>

            <a-select
              :default-value="0"
              size="small"
              placeholder="Select target field"
              v-model="itemModel.target_field_id"
            >
              <a-select-option
                v-for="t in localActions.find(a => a.endpoint === triggerType).params"
                :key="t.name"
                :value="t.name"
              >
                {{ t.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>

        <a-col :span="12">
          <a-form-model-item ref="source_field_id" prop="source_field_id" :rules="itemRules.source_field_id">
            <template slot="label">
              <a-radio-group
                buttonStyle="solid"
                size="small"
                v-model="itemModel.useVar"
                :default-value="3"
              >
                <a-radio-button :value="3">Field</a-radio-button>
                <a-radio-button :value="2">Variable</a-radio-button>
                <a-radio-button :value="1">Value</a-radio-button>
              </a-radio-group>
            </template>

            <a-select
              v-if="correctParamMode !== 2"
              :default-value="0"
              size="small"
              placeholder="Value from"
              v-model="itemModel.source_field_id"
            >
              <a-select-option
                v-for="s in source_fields"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
  </a-modal>
</template>

<script>
  import {localActions,} from "@/utils/mautils";
  import {mapGetters, mapState} from "vuex";


  export default {
    name: "ParamForm",

    props: {
      item: Object,
      isModal: Boolean,
      editMode: Boolean,
      paramMode: Number,
      correctParamMode: Number,
      triggerType: String,
      target: String,
    },

    data() {
      return {
        localActions,
        itemModel: {},
        itemRules: {
          source_field_id: [{required: true, message: "Value field required", trigger: 'change'}],
          target_field_id: [{required: true, message: "Param required", trigger: 'change'}],
        },
      };
    },

    computed: {
      ...mapState(['endpoints']),
      ...mapState('mobileDesigner', ['screens']),
      ...mapGetters('mobileDesigner', ['getSelectedScreen', 'getScreenById']),

      target_fields() {
        if (this.paramMode === 1) {//Navigation to Screen
          return this.endpoints.find(e => e.id === this.getScreenById(this.target)?.model.model.data_endpoint_id)?.fields?.filter(f => f.dir === 1);
        } else if (this.paramMode === 2) {
          return localActions.find(la => la.endpoint === this.target).params;
        } else if (this.paramMode === 3) {
          return this.endpoints.find(e => e.id === +this.target) ? this.endpoints.find(e => e.id === +this.target).fields.filter(f => f.dir === 1) : [];
        }
        return [];
      },

      source_fields() {
        if (this.itemModel.target_field_id) {
          if (this.getSelectedScreen.model.model.data_field_id) {
            //GET, ARRAY (possible list screen)
            return this.endpoints.find(e => e.id === this.getSelectedScreen.model.model.data_endpoint_id)?.fields.find(af => af.id === this.getSelectedScreen.model.model.data_field_id)?.fields.filter(f => f.dir === 2 && f.valueType === this.target_fields.find(f => f.id === this.itemModel.target_field_id).valueType);
          } else {
            //GET, single object (possible view screen)
            return this.endpoints.find(e => e.id === this.getSelectedScreen.model.model.data_endpoint_id)?.fields.filter(f => f.dir === 2 && f.valueType === this.target_fields.find(f => f.id === this.itemModel.target_field_id)?.valueType);
          }
        } else return [];
      },

      visible: {
        get() {
          return this.isModal;
        },
        set(v) {
          if (!v) this.$emit('closeParamModal');
        },
      },
    },

    created() {
      this.itemModel = JSON.parse(JSON.stringify(this.item));
    },

    methods: {
      saveTriggerAndClose(e) {
        this.$refs.paramForm.validate(valid => {
          if (valid) this.$emit('saveParam', this.itemModel);
        });
      },
    },
  }
</script>
