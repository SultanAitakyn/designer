<template>
  <a-badge :numberStyle="{ color: 'rgba(0,0,0,.55)', background: 'white', 'border-radius': '7px' }">
    <a-icon v-if="value" @click="clear" slot="count" shape="circle" type="close-circle" style="cursor: pointer" />
    <a-popover v-model="isOpen" trigger="click">
      <div slot="title" class="">
        <div class="generic-color-title mt-1">
          <div class="mb-2">{{ title }}</div>
          <a-icon class="pt-1" type="close" @click="isOpen = false" />
        </div>
      </div>
      <div slot="content" class="generic-color-picker">
        <a-tabs :tab-position="tabPosition" :size="tabSize" type="card" default-active-key="0">
          <a-tab-pane v-for="(picker, i) in pickers" :key="String(i)" :tab="picker">
            <component :is="picker" :value="value" @input="updateValue($event, i)" />
          </a-tab-pane>
        </a-tabs>
      </div>
      <a-button :style="{ background: value }">
      </a-button>
    </a-popover>
  </a-badge>
</template>

<script>
import ColorPickers from 'vue-color';

export default {
  name: 'GenericColorPicker',
  props: {
    tabSize: {
      type: String,
      default: 'large',
      validator(v) {
        return ['large', 'default', 'small'].includes(v);
      },
    },
    tabPosition: {
      type: String,
      default: 'top',
      validator(v) {
        return ['left', 'right', 'top', 'bottom'].includes(v);
      },
    },
    title: {
      type: String,
      default: 'Pick a color',
      validator(v) {
        return typeof v === 'string';
      },
    },
    pickers: {
      type: Array,
      default: () => ['Swatches', 'Chrome'],
      validator(v) {
        const pickers = ['Swatches', 'Chrome', 'Photoshop', 'Material', 'Compact', 'Sketch', 'Grayscale'];
        const unknownPickers = v.filter(p => !pickers.includes(p))
        return unknownPickers.length === 0
      }
    },
    value: {
      type: String,
      default: '',
      validator(v) {
        return typeof v === 'string';
      },
    }
  },
  components: {
    ...ColorPickers,
  },
  data() {
    return {
      isOpen: false,
      closeOnChangePickers: ['Swatches'],
    };
  },
  methods: {
    updateValue({ hex }, i) {
      this.$emit('input', hex);
      if (this.closeOnChangePickers.includes(this.pickers[i])) {
        this.isOpen = false;
      }
    },
    clear() {
      this.$emit('input', '');
    }
  },
}
</script>

<style>
.generic-color-title {
  display: flex;
  justify-content: space-between;
}

.generic-color-picker > .ant-tabs-card > .ant-tabs-content > .ant-tabs-tabpane {
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}

.generic-color-picker .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
  border: 0!important;
}

.generic-color-picker .vc-swatches {
  box-shadow: none!important;
}

.generic-color-picker .vc-chrome {
  width: 90%;
  box-shadow: none;
}

.generic-color-picker .vc-material {
  width: 90%;
  height: auto;
  max-width: 300px;
  box-shadow: none!important;
}
</style>
