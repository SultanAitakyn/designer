import {flexDirections, horizontalAlignValues, sizeUnits, verticalAlignValues, mobIcons, widgetTypes} from "@/utils/mautils";
import {mapMutations, mapState} from "vuex";

export default {
  props: {
    elem: Object,
    disableDrag: Boolean,
    parentScreenKey: String,
    isRootStack: Boolean,
    formKey: String,
    elemsLimit: Number
  },

  data() {
    return {
      flexDirections, horizontalAlignValues, sizeUnits, verticalAlignValues, mobIcons, widgetTypes
    }
  },

  /*directives: {
    focus: {
      bind(el, _, vnode) {
        el.addEventListener('click', event => {
          event.stopPropagation()
          vnode.context.setSelectedElem(vnode.context.elem);
        })
        el.style.boxShadow = vnode.context.selectedElem === vnode.context.elem && !vnode.context.disableDrag ? '0px 0px 4px 0px #00adff' : ''
      },
    }
  },*/

  computed: {
    ...mapState('mobileDesigner', ['app', 'selectedElem']),

    width() {
      if (this.elem.model.width) {
        return this.size(this.elem.model.width)
      }
    },
    height() {
      if (this.elem.model.height) {
        return this.size(this.elem.model.height)
      }
    },
    sizes() {
      if (this.elem.model.width || this.elem.model.height) {
        return {width: this.width, height: this.height}
      }
    },
    margins() {
      if (this.elem.model.margin) {
        return {
          marginTop: this.elem.model.margin[0] + 'px',
          marginRight: this.elem.model.margin[1] + 'px',
          marginBottom: this.elem.model.margin[2] + 'px',
          marginLeft: this.elem.model.margin[3] + 'px',
        }
      }
    },
    paddings() {
      if (this.elem.model.padding) {
        return {
          paddingTop: this.elem.model.padding[0] + 'px',
          paddingRight: this.elem.model.padding[1] + 'px',
          paddingBottom: this.elem.model.padding[2] + 'px',
          paddingLeft: this.elem.model.padding[3] + 'px',
        }
      }
    },
    border() {
      if (this.elem.model.border?.width) {
        return `solid ${this.elem.model.border.width}px ${this.color(this.elem.model.border.color)}`
      }
    },
    borderRadiuses() {
      if (this.elem.model.border?.radius) {
        return {
          borderTopLeftRadius: this.size(this.elem.model.border.radius[0]),
          borderTopRightRadius: this.size(this.elem.model.border.radius[1]),
          borderBottomRightRadius: this.size(this.elem.model.border.radius[2]),
          borderBottomLeftRadius: this.size(this.elem.model.border.radius[3]),
        }
      }
    },
    backgroundColor() {
      if (this.elem.model.background?.color) {
        return this.color(this.elem.model.background.color)
      }
    },
    backgroundImage() {
      if (this.elem.model.background?.file_id) {
        return `url('/api/bff//files/${this.elem.model.background.file_id}/download/')`
      }
    },
    background() {
      if (this.elem.model.background) {
        if (this.backgroundColor && !this.backgroundImage) {
          return this.backgroundColor
        }
        if (!this.backgroundColor && this.backgroundImage) {
          return `${this.backgroundImage} no-repeat center`
        }
        if (this.backgroundColor && this.backgroundImage) {
          return `${this.backgroundColor} ${this.backgroundImage} no-repeat center`
        }
      }
    },
    flexDirection() {
      if (this.elem.model.direction) {
        return flexDirections.find(x => x.value === this.elem.model.direction).css
      }
    },
    justifyContent() {
      if (this.elem.model.horizontal_align) {
        return horizontalAlignValues.find(x => x.value === this.elem.model.horizontal_align).css
      }
    },
    alignItems() {
      if (this.elem.model.vertical_align) {
        return verticalAlignValues.find(x => x.value === this.elem.model.vertical_align).css
      }
    },
    font(){
      if (this.elem.model.font) {
        return {
          fontSize: this.elem.model.font.size + 'px',
          fontWeight: this.elem.model.font.weight,
          fontStyle: this.elem.model.font.italic ? 'italic' : 'normal',
        }
      }
    }
  },

  created() {
    if (this.parentScreenKey) {
      this.elem.model.parent_screen_key = this.parentScreenKey
    }
    if (this.isRootStack) {
      this.elem.model.isRootStack = this.isRootStack;
    }
    if (this.formKey) {
      this.elem.model.form_key = this.formKey;
    }
    if (!this.elem.model.hasOwnProperty('children')) {
      this.$set(this.elem.model, 'children', [])
    }
  },

  methods: {
    ...mapMutations('mobileDesigner', ['setSelectedElem']),

    size(property) {
      if (property && property.size >= 0) {
        let unit = sizeUnits.find(x => x.value === property.unit)?.css || 'px'
        return property.size + unit
      }
    },
    color(property) {
      if (property) {
        return property.name ? this.app.colors[property.name] : property.hex
      }
    },
    handleClick(event) {
      event.stopPropagation();
      this.setSelectedElem(this.elem)
    },
  },
}
