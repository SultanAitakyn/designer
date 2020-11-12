<template>
  <div class="editable-cell">
    <div v-if="editable" class="editable-cell-input-wrapper">
      <a-input :value="value" size="small" @change="handleChange" @pressEnter="check" style="width: 128px;"/>
      <a-icon
        type="check"
        class="editable-cell-icon-check"
        :style="{color: (!this.value || this.value === 'New color') ? 'rgba(0, 0, 0, .25)' : '' }"
        @click="check"
      />
    </div>
    <div v-else class="editable-cell-text-wrapper">
      {{ value ? value.charAt(0).toUpperCase() + value.slice(1).replace("_", " ") : ' ' }}
      <a-icon type="edit" class="editable-cell-icon" @click="edit"/>
    </div>
  </div>
</template>

<script>
  import { snakeCase } from 'lodash-es';


  export default {
    name: "MAColorsSettingColorSetting",
    props: {
      text: String,
      appColors: Object
    },
    data() {
      return {
        value: this.text.charAt(0).toUpperCase() + this.text.slice(1).replace("_", " "),
        editable: false,
      };
    },
    created() {
      if (this.value === 'New color') {
        this.edit()
      }
    },
    methods: {
      handleChange(e) {
        const value = e.target.value;
        this.value = value;
      },
      edit() {
        this.editable = true
      },
      check() {
        if (this.value && this.value !== 'New color' && !Object.keys(this.appColors).includes(snakeCase(this.value))) {
          this.editable = false;
          this.$emit('change', this.value);
        }
      },
    },
  }
</script>

<style scoped>
  .editable-cell {
    position: relative;
  }

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    line-height: 18px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell:hover .editable-cell-icon {
    display: inline-block;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
</style>
