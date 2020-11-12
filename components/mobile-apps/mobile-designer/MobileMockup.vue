<template>
  <div
    ref="mockupRef"
    style="position: relative; transform-origin: 50% 0"
    :style="{transform: `scale(${mockupScale})`}"
  >
    <img
      src="@/assets/img/mobile-designer/iphone-mockup-410x830(360x770).png"
      srcset="@/assets/img/mobile-designer/iphone-mockup-410x830(360x770)@2x.png 2x"
      style="display: block; position: relative; z-index: 2; pointer-events: none;"
      alt="Mockup"
    />
    <div
      class="mockup-body"
      style="position: absolute; z-index: 1; top: 26px; left: 25px; right: 25px; bottom: 34px;"
    >
      <component
        v-if="screen"
        :key="screen.model.model.key"
        :is="screenTypes.find(x=> x.enum_id===screen.model.type) ? screenTypes.find(x=> x.enum_id===screen.model.type).type : ''"
        :screen="screen"
        style="height: 100%"
      />
    </div>
  </div>
</template>

<script>
  import {mapState} from "vuex";
  import {screenTypes} from "@/utils/mautils";
  import masView from "@/components/mobile-apps/mobile-designer/screens/mas-view";
  import masList from "@/components/mobile-apps/mobile-designer/screens/mas-list";
  import masGrid from "@/components/mobile-apps/mobile-designer/screens/mas-grid";
  import masMap from "@/components/mobile-apps/mobile-designer/screens/mas-map";
  import masModal from "@/components/mobile-apps/mobile-designer/screens/mas-modal";
  import masTabs from "@/components/mobile-apps/mobile-designer/screens/mas-tabs";
  import masSidemenu from "@/components/mobile-apps/mobile-designer/screens/mas-sidemenu";
  import masBottomnav from "@/components/mobile-apps/mobile-designer/screens/mas-bottomnav";
  import masBottomsheet from "@/components/mobile-apps/mobile-designer/screens/mas-bottomsheet";
  import masBreadcrumbslist from "@/components/mobile-apps/mobile-designer/screens/mas-breadcrumbslist";

  export default {
    name: "MobileMockup",

    components: {
      'mas-view': masView,
      'mas-list': masList,
      'mas-grid': masGrid,
      'mas-map': masMap,
      'mas-tabs': masTabs,
      'mas-sidemenu': masSidemenu,
      'mas-bottomnav': masBottomnav,
      'mas-bottomsheet': masBottomsheet,
      'mas-breadcrumbslist': masBreadcrumbslist,
      'mas-modal': masModal,
    },

    data() {
      return {
        screenTypes,
        mockupScale: 1
      }
    },

    computed: {
      ...mapState('mobileDesigner', ['screens', 'selectedScreenIndex']),
      screen() {
        return this.screens[this.selectedScreenIndex]
      }
    },

    mounted() {
      this.ready(() => {
        const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            if (entry.contentBoxSize && entry.contentBoxSize.length && this.$refs.mockupRef && entry.contentBoxSize[0].inlineSize && this.$refs.mockupRef.clientWidth && entry.contentBoxSize[0].blockSize && this.$refs.mockupRef.clientHeight) {
              this.mockupScale = Math.min(
                entry.contentBoxSize[0].inlineSize / this.$refs.mockupRef.clientWidth,
                entry.contentBoxSize[0].blockSize / this.$refs.mockupRef.clientHeight,
              )
            }
          }
        })
        resizeObserver.observe(this.$refs.mockupRef.parentElement)
      })
    },

    methods: {
      // Hack for vue.js 2
      // https://github.com/vuejs/Discussion/issues/394
      ready(fn) {
        if (process.env.NODE_ENV === 'production') {
          return this.$nextTick(fn);
        }
        setTimeout(() => {
          this.$nextTick(fn);
        });
      }
    }
  };
</script>

<style scoped>
  >>> .mobile-scrollbar::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  >>> .mobile-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, .25);
  }
</style>
