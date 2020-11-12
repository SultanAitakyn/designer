<template>
  <div :class="{ 'editor-form-container': !modal }">
    <a-form :form="form" @submit="onFormSubmit">
      <a-row>
        <a-col :span="24">
          <a-form-item
            label="From"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-select
              v-decorator="[
                'from',
                {
                  initialValue: link ? link.from.id : null,
                  rules: [
                    {
                      required: true,
                      message: 'Please select source block'
                    },
                    {
                      validator: uniqueLinkValidator
                    }
                  ]
                }
              ]"
              placeholder="From"
              @change="fixEquality($event, false)"
            >
              <a-select-option
                v-for="block in schema.blocks"
                :value="block.id"
                :key="block.id"
                >{{ block.name }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24">
          <a-form-item
            label="To"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-select
              v-decorator="[
                'to',
                {
                  initialValue: link ? link.to.id : null,
                  rules: [
                    {
                      required: true,
                      message: 'Please select target block'
                    },
                    {
                      validator: uniqueLinkValidator
                    }
                  ]
                }
              ]"
              placeholder="To"
              @change="fixEquality($event, true)"
            >
              <a-select-option
                v-for="block in schema.blocks"
                :value="block.id"
                :key="block.id"
                >{{ block.name }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24" :style="{ textAlign: 'right' }">
          <a-form-item :wrapper-col="{ span: 24 }">
            <a-button type="primary" html-type="submit">
              Save
            </a-button>
            <a-button :style="{ marginLeft: '8px' }" @click="close">
              Cancel
            </a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script>
import { Link } from "@/components/bp-editor/link/Link";

export default {
  name: "LinkForm",
  props: {
    modal: {
      type: Boolean
    },
    link: {
      type: Link
    }
  },
  data() {
    return {
      form: this.$form.createForm(this, { name: "link" })
    };
  },
  computed: {
    schema() {
      return this.$store.getters.getSchema;
    }
  },
  methods: {
    onFormSubmit(event) {
      event.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$emit("submit", values);
          this.close();
        }
      });
    },
    close() {
      this.$emit("close");
    },
    fixEquality(newValue, isTargetChanged) {
      const source = this.form.getFieldValue("from");
      const target = this.form.getFieldValue("to");
      if (isTargetChanged ? source === newValue : target === newValue) {
        for (const block in this.schema.blocks) {
          if (this.schema.blocks.hasOwnProperty(block) && newValue !== block) {
            this.form.setFieldsValue({
              [isTargetChanged ? "from" : "to"]: block
            });
          }
        }
      }
    },
    changeType(type) {
      this.type = type;
    },
    uniqueLinkValidator(rule, value, callback) {
      const isUnique = this.schema.checkLinkUniqueness(
        value,
        this.form.getFieldValue(rule.field === "from" ? "to" : "from"),
        this.link
      );
      if (isUnique) {
        callback();
      } else {
        callback(new Error("Link between these blocks already exists"));
      }
    }
  },
  mounted() {
    if (!this.link) {
      const names = Object.keys(this.schema.blocks);
      this.form.setFieldsValue({ from: names[0], to: names[1] });
    }
  }
};
</script>

<style scoped>
.editor-form-container {
  width: 28.375rem;
}
</style>
