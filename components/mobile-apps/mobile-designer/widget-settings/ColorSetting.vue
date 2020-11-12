<template>
  <a-space>
    <a-select
      v-model="color.name"
      :size="size"
      :placeholder="color.hex ? 'Custom color' : ''"
      option-label-prop="label"
      allowClear
      style="width: 130px;"
      @change="handleSelect"
    >
      <a-select-option
        v-for="param in colorSchemeParams"
        :key="param.name"
        :value="param.name"
        :label="param.label"
      >
        <span
          style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: solid 1px rgba(0,0,0,.25); margin-right: 2px;"
          :style="{backgroundColor: app.colors[param.name]}"
        />
        {{ param.label }}
      </a-select-option>
    </a-select>

    <ColorPickerPopover
      v-model="color.hex"
      :size="size"
      @change="handlePick"
    />
  </a-space>
</template>

<script>
  import {mapState} from "vuex";
  import ColorPickerPopover from "@/components/shared/ColorPickerPopover";


  export default {
    name: "ColorSetting",

    components: {
      ColorPickerPopover,
    },

    model: {
      prop: 'color',
      event: 'change'
    },

    props: {
      color: {
        type: Object,
        default() {
          return {
            hex: '',
            name: ''
          }
        }
      },
      size: String
    },

    computed: {
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
      if (this.color.name) {
        this.color.hex = this.app.colors[this.color.name]
      }
    },

    methods: {
      handleChange() {
        this.$emit('change', this.color)
      },

      handlePick() {
        this.color.name = undefined
        this.handleChange()
      },

      handleSelect() {
        if (this.color.name) {
          this.color.hex = this.app.colors[this.color.name]
        }
        this.handleChange()
      },
    }
  }
</script>
