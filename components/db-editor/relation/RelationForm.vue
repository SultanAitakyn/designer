<template>
  <div
    :class="{ 'editor-form-container': !modal }"
    :style="{
      top: position ? position.y + 'px' : 'auto',
      left: position ? position.x + 'px' : 'auto'
    }"
  >
    <a-form-model :form="form" ref="form" :model="rel" layout="vertical">
      <a-row>
        <a-col :span="12" style="padding: 6px;">
          <a-form-model-item class="bottom-small"
                             prop='source.name'
                             name="source.name"
                             hasFeedback
                             :rules="[{required: true,message: 'Please select source model', trigger: ['blur', 'change']}]">
              <template slot="label">
                Source
                <a-tooltip>
                  <template slot="title">
                    Source model, model to form relation from
                  </template>
                  <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
                </a-tooltip>
              </template>
            <a-select
              v-model="rel.source.name"
              placeholder="Source model"
              @change="onSourceChange">
              <a-select-option
                v-for="model in models"
                :value="model.name"
                :key="model.name"
              >{{ model.name }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="12" style="padding: 6px;">
          <a-form-model-item class="bottom-small"
                             v-if="rel.target.name && rel.type"
                             prop='sourceFieldName'
                             name="sourceFieldName"
                             hasFeedback
                             :rules="[{required: true, message: 'Field name required', trigger: ['blur', 'change']},
                                      {validator: nameValidator('source', 'sourceFieldName', 'targetFieldName'), trigger: ['blur', 'change']}]">
            <template slot="label">
              Field Name
              <a-tooltip>
                <template slot="title">
                  Field name, that will be created in the source model for this relation
                </template>
                <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
              </a-tooltip>
            </template>
            <a-input
              :maxLength="255"
              v-model="rel.sourceFieldName"
              placeholder="Source Field Name"
            />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24" style="padding: 6px;">
          <a-form-model-item class="bottom-small"
                             prop='type'
                             name="type"
                             :rules="[{ required: true, message: 'Please select relation type'}]">
            <template slot="label">
              Relation type
              <a-tooltip>
                <template slot="title">
                  Relation type defines interaction between models. See documentation for help.
                </template>
                <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
              </a-tooltip>
            </template>
            <a-radio-group
              buttonStyle="solid"
              v-model="rel.type"
              @change="changeType"
            >
              <a-radio-button
                v-for="(value, type) in types"
                :value="value"
                :key="type"
              >{{ type.toLowerCase() }}</a-radio-button>
            </a-radio-group>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="12" style="padding: 6px;">
          <a-form-model-item class="bottom-small"
                             prop='target.name'
                             name="target.name"
                             hasFeedback
                             :rules="[{required: true,message: 'Please select target model'}]">
            <template slot="label">
              Target
              <a-tooltip>
                <template slot="title">
                  Target model, model to form relation from
                </template>
                <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
              </a-tooltip>
            </template>
            <a-select
              v-model="rel.target.name"
              placeholder="Target Model"
              @change="onTargetChange"
            >
              <a-select-option
                v-for="model in models"
                :value="model.name"
                :key="model.name"
              >{{ model.name }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="12" style="padding: 6px;">
          <a-form-model-item class="bottom-small"
                             v-if="rel.source.name && rel.type"
                             prop='targetFieldName'
                             name="targetFieldName"
                             hasFeedback
                             :rules="[{required: true, message: 'Field name required', trigger: ['blur', 'change']},
                                      {validator: nameValidator('target', 'targetFieldName', 'sourceFieldName'), trigger: ['blur', 'change']}]">
            <template slot="label">
              Field Name
              <a-tooltip>
                <template slot="title">
                  Field name, that will be created in the target model for this relation
                </template>
                <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
              </a-tooltip>
            </template>
            <a-input
              :maxLength="255"
              v-model="rel.targetFieldName"
              placeholder="Target Field Name"
            />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row v-if="rel.source.name && models[rel.source.name] && models[rel.source.name].relation_options">
        <a-col :span="24" style="padding: 6px;">
          <a-form-model-item class="bottom-small"
                             v-for="opt in models[rel.source.name].relation_options" :key="opt.id"
                             prop='targetFieldName'
                             name="targetFieldName"
                             hasFeedback
                             :rules="[]">
            <template slot="label">
              {{opt.name}}
              <a-tooltip v-if="opt.description">
                <template slot="title">
                  {{opt.description}}
                </template>
                <a-icon type="question-circle" style="font-size: smaller; vertical-align: baseline;"/>
              </a-tooltip>
            </template>
            <span v-for="param in opt.params" :key="'o'+opt.id+'p'+param.id" style="margin-right: 10px;">
              {{param.name}}
              <a-switch
                v-if="param.type===2"
                :checked="rel.options.find(x=> x.option_id===opt.id).params.find(p=> p.param_id===param.id).value"
                @change="(v) => {rel.options.find(x=> x.option_id===opt.id).params.find(p=> p.param_id===param.id).value=v;}">
                <a-icon type="check" slot="checkedChildren"/>
                <a-icon type="close" slot="unCheckedChildren"/>
              </a-switch>
            </span>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24" :style="{ textAlign: 'right' }" style="padding: 6px;">
          <a-form-model-item :wrapper-col="{ span: 24 }">
            <a-button @click="close">Cancel</a-button>
            <a-button :style="{ marginLeft: '8px' }" type="primary" @click="onFormSubmit">Save</a-button>
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
  </div>
</template>

<script>
import paper from "paper";
import {
  Relation,
  RelationType
} from "@/components/db-editor/relation/Relation";
import { clone } from 'lodash-es';
import {
  checkFirstSymbolIsLetter,
  checkRelationNameDuplicates,
  checkPermittedSymbols,
} from '../utils';

export default {
  name: "RelationForm",
  props: {
    modal: {
      type: Boolean
    },
    relation: {
      type: Relation
    }
  },
  data() {
    return {
      form: this.$form.createForm(this, { name: "relation" }),
      rel: {
        source: {},
        sourceFieldName:undefined,
        type:undefined,
        target: {},
        targetFieldName:undefined,
        options: []
      },
      fnm: 0,
      types: RelationType,
      type: 0
    };
  },
  computed: {
    position() {
      let position = null;
      if (this.relation) {
        position = paper.project.view.matrix.transform(
          new paper.Point(
            this.relation.canvasElement.group.position.x +
              16 / paper.project.view.zoom,
            this.relation.canvasElement.group.position.y -
              10 / paper.project.view.zoom
          )
        );
      }
      return position;
    },
    models() {
      return this.$store.getters.getSchema.models;
    }
  },
  methods: {
    onFormSubmit(event) {
      event.preventDefault();
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.rel.options && this.rel.options.length>0)
            this.rel.options=this.convertOptionsToStrings(this.rel.options);
          this.$emit("submit", this.rel);
          this.close();
        }
      });
    },
    close() {
      this.$emit("close");
    },

    onSourceChange(val){
      if (this.rel.source.name && this.rel.type) this.rel.targetFieldName=this.genFieldName(this.rel.source.name, this.rel.type);
      if (this.rel.source.name && this.models[this.rel.source.name] && this.models[this.rel.source.name].relation_options) {
        this.rel.options=this.fillDefaultOptions(this.models[this.rel.source.name]);
      }
    },

    fillDefaultOptions(model){
      let relopt=model.relation_options;
      let options=[];
      for (let i=0; i<relopt.length; i+=1 )
        if (relopt[i].params.length>0){
          let option = {
            option_id: relopt[i].id,
            params: []
          };
          for (let p=0; p<relopt[i].params.length; p+=1){
            option.params.push({
              param_id: relopt[i].params[p].id,
              value: this.convertValueToRealType(relopt[i].params[p].type, relopt[i].params[p].default_value),
            })
          }
          options.push(option);
        }
      return options;
    },

    convertOptionsToStrings(opt){
      let options=[];
      for (let i=0; i<opt.length; i+=1 )
        if (opt[i].params.length>0){
          let option = {
            option_id: opt[i].option_id,
            params: []
          };
          for (let p=0; p<opt[i].params.length; p+=1){
            option.params.push({
              param_id: opt[i].params[p].param_id,
              value: opt[i].params[p].value.toString(),
            })
          }
          options.push(option);
        }
      return options;
    },

    convertOptionsToRealTypes(model, opt){
      let options=[];
      for (let i=0; i<opt.length; i+=1 )
        if (opt[i].params.length>0){
          let option = {
            option_id: opt[i].option_id,
            params: []
          };
          for (let p=0; p<opt[i].params.length; p+=1){
            option.params.push({
              param_id: opt[i].params[p].param_id,
              value: this.convertValueToRealType(
                model.relation_options.find(x=> x.id===opt[i].option_id)
                  .params.find(z=> z.id===opt[i].params[p].param_id).type, opt[i].params[p].value),
            });
          }
          options.push(option);
        }
      return options;
    },

    convertValueToRealType(type,value){
      //Check for already string types
      if ([3,4,9,10,11,12,13,15,20].includes(type)) return value;
      switch (type) {
        case 1: //integer
          return parseInt(value);
        case 2: //boolean
          return value === 'true';
        //3 (string) and 4 (datetime) not needed to be converted
        case 6: //array
          return JSON.parse(value) || [];
        case 7: //enum
          return parseInt(value) || undefined;
        case 14: //float
          return parseFloat(value);
      }
    },

    onTargetChange(val){
      if (this.rel.target.name && this.rel.type) this.rel.sourceFieldName=this.genFieldName(this.rel.target.name, this.rel.type);
    },

    genFieldName(name, type){
      switch (type) {
        case 1:
          return name;
        case 2:
          return name+'s';
        case 3:
          return name+'s';
      }
    },

    changeType(type) {
      if (this.rel.source.name) this.rel.targetFieldName=this.genFieldName(this.rel.source.name, this.rel.type===2 ? 1 : this.rel.type);
      if (this.rel.target.name) this.rel.sourceFieldName=this.genFieldName(this.rel.target.name, this.rel.type);
    },
    nameValidator(commonKey, relationCompareKey, ignoreCompareKey) {
      return (_, value, callback) => {
        try {
          if (this.relation && value === this.relation[relationCompareKey]) {
            callback();
            return;
          }

          if (this.rel.sourceFieldName === this.rel.targetFieldName && this.rel.source.name === this.rel.target.name) {
            throw Error("Fields can't have the same name in self relation");
          }

          checkFirstSymbolIsLetter(value);
          checkPermittedSymbols(value);
          checkRelationNameDuplicates(this.models[this.rel[commonKey].name].fields, value, this.relation && this.relation[ignoreCompareKey]);

          callback();
        } catch (err) {
          callback(err);
        }
      }
    },
  },
  beforeMount() {
    if (this.relation){
      this.rel.sourceFieldName=this.relation.sourceFieldName;
      this.rel.targetFieldName=this.relation.targetFieldName;
      this.rel.type=this.relation.type;
      this.rel.source = clone(this.relation.source);
      this.rel.target = clone(this.relation.target);
      if (!this.relation.options.length>0 && this.rel.source.name && this.models[this.rel.source.name] && this.models[this.rel.source.name].relation_options){
        //No options in rel, but there is a model with options => fill with default values to preserve reactivity
        this.rel.options=this.fillDefaultOptions(this.models[this.rel.source.name]);
      }
      else if (this.rel.source.name && this.models[this.rel.source.name] && this.models[this.rel.source.name].relation_options)
        //Convert options to real types
        //TODO: Add new params, if module options was upgraded and rel has now new options, but old
        this.rel.options=this.convertOptionsToRealTypes(this.models[this.rel.source.name], JSON.parse(JSON.stringify(this.relation.options)));
      else this.rel.options=[]; //Model not support options, neither will have the relation
    }
  },

};
</script>

<style scoped>
.editor-form-container {
  width: 28.375rem;
}
  .bottom-small {
    margin-bottom: 2px;
    padding-bottom: 0px;
  }
</style>
