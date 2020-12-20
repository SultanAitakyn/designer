<template>
  <div
    :class="{ 'editor-form-container': !modal }"
    :style="{
      top: position ? position.y + 'px' : 'auto',
      left: position ? position.x + 'px' : 'auto'
    }"
  >
    <a-form :form="form" @submit="onFormSubmit">
      <a-form-item
        required
        label="Model name"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-input
          :disabled="model && model.module_model_id"
          :maxLength="31"
          v-decorator="[
            'name',
            {
              initialValue: model ? model.name : '',
              rules: [
                { validator: modelNameValidator }
              ]
            }
          ]"
          placeholder="Model name (required)"
        />
      </a-form-item>

      <a-form-item
        label="Model description"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-textarea
          :auto-size="{ minRows: 2, maxRows: 3 }"
          :disabled="model && model.module_model_id"
          v-decorator="[
            'comment',
            {
              initialValue: model ? model.comment : ''
            }
          ]"
          placeholder="Model description (recommended)"
        />
      </a-form-item>
      <a-alert style="font-size: small;"
               v-if="model && model.module_model_id"
               show-icon
               message="This model belongs to the module. It can't be edited."
               type="info"
      />
      <a-form-item :wrapper-col="{ span: 24 }" v-if="!model || !model.module_model_id">
        <a-col :span="24" :style="{ textAlign: 'right' }">
          <a-button  @click="close">
            Cancel
          </a-button>
          <a-button type="primary" html-type="submit" :style="{ marginLeft: '0.5rem' }">
            Save
          </a-button>
        </a-col>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import paper from "paper";
import { Model, ModelOrderType } from "./Model";
import { toLower, camelCase } from 'lodash-es';
import {
  checkReservedModelWordsDuplicate,
  checkFirstSymbolIsLetter,
  checkReservedDuplicate,
  checkPermittedSymbols,
  checkNameDuplicates
} from '../utils';

export default {
  name: "ModelForm",
  props: {
    modal: {
      type: Boolean
    },
    model: {
      type: Model
    }
  },

  data() {
    return {
      form: this.$form.createForm(this, { name: "model" }),
      orderTypes: ModelOrderType
    };
  },
  computed: {
    position() {
      let position = null;
      if (this.model) {
        position = paper.project.view.matrix.transform(
          new paper.Point(
            this.model.canvasElement.group.children[0].bounds.rightCenter.x +
              16 / paper.project.view.zoom,
            this.model.canvasElement.group.children[0].bounds.rightCenter.y -
              16 / paper.project.view.zoom
          )
        );
        this.schema.adjustDimensions({
          x: position.x + 360,
          y: position.y + 400
        });
      }
      return position;
    },
    schema() {
      return this.$store.getters.getSchema;
    }
  },
  methods: {
    onFormSubmit(event) {
      event.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$emit("submit", {
            ...values
          });
          this.close();
        }
      });
    },
    close() {
      this.form.resetFields();
      this.$emit("close");
    },
    modelNameValidator(_, value, callback) {
      try {
        if (!value.trim()) throw Error('Model name required!');
        checkFirstSymbolIsLetter(value);
        checkPermittedSymbols(value);
        checkReservedModelWordsDuplicate(value);
        checkNameDuplicates(this.schema.models, value, this.model && this.model.id);

        callback();
      } catch (err) {
        callback(err);
      }
    },
  }
};
</script>

<style scoped>
.vc-compact {
  width: auto;
}
</style>

<style>
.two-rows-label .ant-form-item-label {
  padding: 4px 0 !important;
}
.two-rows-label .ant-form-item-label label {
  white-space: normal;
  margin-right: 33px;
  display: inline-block;
  text-align: left;
  line-height: 14px;
  width: 50px;
}
.two-rows-label .ant-form-item-label label .ant-form-item-required:before {
  position: absolute;
  left: -7px;
}
</style>
