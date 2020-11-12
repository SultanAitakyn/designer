<template>
  <div
    style="flex-shrink: 0; display: grid; grid-template-columns: 1fr auto 1fr; align-items: end; height: 100px; padding: 0 16px 16px; font-size: larger;"
    :style="{
      backgroundColor: app.colors.primary,
      color: app.colors.primary_text
    }"
  >
    <div>
      <a-icon
        v-for="action in screen.model.model.actions && screen.model.model.actions.filter(a => a.trigger === 11 && a.float_left)"
        :key="action.key"
        :type="mobIcons.find(x=> x.value===action.icon.name) ? mobIcons.find(x=> x.value===action.icon.name).label : 'stop'"
        :style="{color: action.icon && color(action.icon.color)}"
        style="margin-right: 8px;"
      />
    </div>

    <div>
      {{ screen.model.model.navigation.title }}
    </div>

    <div style="text-align: right;">
      <a-icon
        v-for="action in screen.model.model.actions && screen.model.model.actions.filter(a => a.trigger === 11 && !a.float_left)"
        :key="action.key"
        :type="mobIcons.find(x=> x.value===action.icon.name) ? mobIcons.find(x=> x.value===action.icon.name).label : 'stop'"
        :style="{color: action.icon && color(action.icon.color)}"
        style="margin-left: 8px;"
      />
    </div>
  </div>
</template>

<script>
  import {mobIcons} from "@/utils/mautils";
  import {mapState} from "vuex";


  export default {
    name: "ScreenHeader",
    props: {
      screen: Object
    },
    data() {
      return {
        mobIcons
      }
    },
    computed: {
      ...mapState('mobileDesigner', ['app'])
    },
    methods: {
      color(property) {
        if (property) {
          return property.name ? this.app.colors[property.name] : property.hex
        }
      },
    }
  }
</script>
