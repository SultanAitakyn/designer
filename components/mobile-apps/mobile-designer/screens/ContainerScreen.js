import BaseScreen from "@/components/mobile-apps/mobile-designer/screens/BaseScreen";
import {mapMutations, mapState} from "vuex";

export default {
  mixins: [BaseScreen],
  data() {
    return {
      childScreen: {}
    }
  },
  computed: {
    ...mapState('mobileDesigner', ['screens']),
    background() {
      if (this.screen.model.model.background) {
        return this.color(this.screen.model.model.background.color)
      }
    },
  },
  created() {
    if (this.screen.model.model.children && this.screen.model.model.children.length) {
      this.setChildScreen(this.screen.model.model.children[0]?.model.actions?.find(x => x.trigger === 11 && x.type === 1)?.screen.model.key)
      this.setSelectedElem(this.screen.model.model.children[0])
    }
  },
  methods: {
    ...mapMutations('mobileDesigner', ['setSelectedElem']),
    setChildScreen(key) {
      this.childScreen = this.screens.find(s => s.model.model.key === key)
    }
  }
}
