<template>
  <div>
    <a-form-model-item label="Background Color">
      <ColorSetting v-model="background.color" :size="size" @change="emitChange"/>
    </a-form-model-item>
    <a-form-model-item label="Background Image">
      <ImageSetting v-model="background.image" @change="$emit('setFileId', $event)"/>
    </a-form-model-item>
  </div>
</template>

<script>
  import ImageSetting from "@/components/mobile-apps/mobile-designer/widget-settings/ImageSetting";
  import ColorSetting from "@/components/mobile-apps/mobile-designer/widget-settings/ColorSetting";


  export default {
    name: "BackgroundSetting",

    components: {
      ImageSetting,
      ColorSetting,
    },

    model: {
      prop: 'background',
      event: 'change'
    },

    props: {
      background: {
        type: Object,
        default() {
          return {
            color: {
              hex: '',
              name: ''
            },
            image: null,
          }
        }
      },
      size: String
    },

    methods: {
      emitChange() {
        this.$emit('change', this.background)
      }
    }
  }
</script>
