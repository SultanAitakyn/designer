import {mobIcons, screenTypes, widgetTypes} from "@/utils/mautils";
import {mapState} from "vuex";

export default {
  props: {
    screen: Object,
    hideHeader: Boolean,
  },
  data() {
    return {
      widgetTypes,
      mobIcons,screenTypes
    }
  },
  computed: {
    ...mapState('mobileDesigner', ['app']),
    background() {
      if (this.screen.model.model.background) {
        return this.color(this.screen.model.model.background.color)
      }
    },
  },
  methods: {
    color(property) {
      if (property) {
        return property.name ? this.app.colors[property.name] : property.hex
      }
    },
  }
}
