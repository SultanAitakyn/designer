<template>
  <span>
    <a-table
      :columns="colorTableColumns"
      :dataSource="Object.keys(colors).map(c => ({name: c, value: colors[c]}))"
      :pagination="false"
      size="small"
    >
      <span slot="name" slot-scope="name">
        <template v-if="['primary', 'primary_text', 'accent', 'accent_text'].includes(name)">
          {{ name.charAt(0).toUpperCase() + name.slice(1).replace("_", " ") }}
        </template>
        <MAColorsSettingColorSetting
          v-else
          :text="name"
          :app-colors="colors"
          @change="changeColorName(name, $event)"
        />
      </span>

      <div slot="actions" slot-scope="_, record">
        <ColorPickerPopover v-model="colors[record.name]" size="small" disableClear @change="emitChange"/>
        <a-icon
          type="delete"
          style="margin-left: 12px"
          :style="{
            color: ['primary', 'primary_text', 'accent', 'accent_text'].includes(record.name) ? 'rgba(0, 0, 0, 0.25)' : 'red',
            cursor: ['primary', 'primary_text', 'accent', 'accent_text'].includes(record.name) && 'not-allowed'
          }"
          @click="deleteColorName(record.name)"
        />
      </div>
    </a-table>

    <a-button
      size="small"
      type="primary"
      style="margin-top: 10px;"
      @click="addNewColor"
    >
      New color
    </a-button>
  </span>
</template>

<script>
  import MAColorsSettingColorSetting from "@/components/mobile-apps/mobile-apps-list/mobile-app-form/MAColorsSettingColorSetting";
  import ColorPickerPopover from "@/components/shared/ColorPickerPopover";
  import {colorSchemes} from "@/utils/mautils";
  import {snakeCase} from "lodash-es";


  export default {
    name: "MAColorsSetting",

    components: {
      ColorPickerPopover,
      MAColorsSettingColorSetting,
    },

    model: {
      prop: 'colors',
      event: 'change'
    },

    props: {
      colors: {
        type: Object,
        defaults: {
          primary: '#303f9f',
          primary_text: '#ffffff',
          accent: '#56ccf2',
          accent_text: '#000000',
        }
      }
    },

    data() {
      return {
        colorSchemes,
        colorTableColumns: [
          {
            title: "Name",
            dataIndex: 'name',
            scopedSlots: {customRender: "name"},
          },
          {
            title: "",
            align: "right",
            scopedSlots: {customRender: "actions"},
          },
        ]
      }
    },

    methods: {
      /*changeScheme(v) {
        if (v) this.formModel.colors = this.colorSchemes.find(x => x.value === v).colors;
      },*/

      emitChange() {
        this.$emit('change', this.colors)
      },

      addNewColor() {
        this.$set(this.colors, 'new_color', '#ffffff')
        this.emitChange()
      },

      changeColorName(oldValue, newValue) {
        if (oldValue !== newValue) {
          this.$set(this.colors, snakeCase(newValue), this.colors[oldValue])
          delete this.colors[oldValue]
          this.emitChange()
        }
      },

      deleteColorName(name) {
        if (!['primary', 'primary_text', 'accent', 'accent_text'].includes(name)) {
          const newColors = {...this.colors}
          delete newColors[name]
          this.$emit('change', newColors)
        }
      },
    }
  }
</script>
