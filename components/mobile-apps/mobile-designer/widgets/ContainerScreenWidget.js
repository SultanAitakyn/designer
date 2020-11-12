import BaseWidget from "@/components/mobile-apps/mobile-designer/widgets/BaseWidget";

export default {
  mixins: [BaseWidget],
  computed: {
    childScreenKey() {
      return this.elem.model.actions?.find(x => x.trigger === 11 && x.type === 1)?.screen.model.key
    }
  },
  watch: {
    childScreenKey(newKey) {
      this.$emit('emitChildScreen', newKey)
    }
  },
  methods: {
    handleClick(event) {
      event.stopPropagation();
      this.$emit('emitChildScreen', this.childScreenKey)
      this.setSelectedElem(this.elem)
    },
  }
}
