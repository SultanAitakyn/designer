<template>
  <div style="max-height: 100%; overflow: hidden; display: flex; flex-direction: column;">
    <div style="overflow-y: auto">
      <div
        v-for="(screen,index) in screens"
        :key="index"
        style="display: flex; justify-content: space-between; border: 1px dotted orange; padding: 2px 6px 2px 6px; margin: 2px;"
      >
        <span>
          <a
            @click="setSelectedScreenIndex(index)"
            :style="{color: selectedScreenIndex !== index ? 'dimgrey' : ''}"
          >
            <a-icon
              :type="screenTypes.find(x=> x.enum_id===screen.model.type).icon"
              v-if="screenTypes.find(x=> x.enum_id===screen.model.type)"
            />
            {{ screen.model.model.navigation.title ? screen.model.model.navigation.title : '(' + screen.name + ')' }}
          </a>
        </span>
        <span>
          <a-tooltip v-if="screen.is_main" title="Application will be started from this screen">
            <a-icon type="home" style="margin-right: 6px; color: #a1a1a1"/>
          </a-tooltip>
          <a-icon type="setting" style="color: #1890ff" @click="showElementModal(screen,true)"/>
        </span>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end;">
      <a-dropdown :trigger="['click']">
        <a-button
          type="primary"
          size="small"
          style="margin-top: 8px;"
        >
          Create screen
          <a-icon type="down"/>
        </a-button>
        <a-menu slot="overlay">
          <a-menu-item
            v-for="screen in screenTypes.filter(x=> x.group==='plainScreens')"
            :key="screen.enum_id"
            @click="createNewScreen(screen.enum_id)"
          >
            <a-tooltip :title="screen.description" :mouseEnterDelay="0.7" placement="left">
              <a-icon :type="screen.icon" v-if="screen.icon"/>
              {{ screen.label }}
            </a-tooltip>
          </a-menu-item>
          <a-menu-divider/>
          <a-menu-item
            v-for="screen in screenTypes.filter(x=> x.group==='wrapperScreens')"
            :key="screen.enum_id"
            @click="createNewScreen(screen.enum_id)"
          >
            <a-tooltip :title="screen.description" placement="left">
              <a-icon :type="screen.icon" v-if="screen.icon"/>
              {{ screen.label }}
            </a-tooltip>
          </a-menu-item>
          <a-menu-divider/>
          <a-sub-menu key="mod_auth">
            <span slot="title">
              <a-icon type="user"/>
              <span style="margin-right: 6px;">Auth module</span>
            </span>
            <a-menu-item
              v-for="screen in screenTypes.filter(x=> x.group==='Auth')"
              :key="screen.enum_id"
              @click="createNewScreen(screen.enum_id)"
              :disabled="true"
            >
              <a-tooltip :title="screen.description" placement="left">
                <a-icon :type="screen.icon" v-if="screen.icon"/>
                {{ screen.label }}
              </a-tooltip>
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-dropdown>
    </div>

    <!--  Element modal form-->
    <component
      :is="elementModal.modal"
      :visible="elementModal.visible"
      :element="elementModal.item"
      @elementModalClose="showElementModal('',false)"
      @save="saveScreenSettings"
      @del="delScreen"
    />
  </div>
</template>

<script>
  import {createNamespacedHelpers} from "vuex";
  import {randStr} from "@/utils/common";
  import {createNewScreen, screenTypes} from "@/utils/mautils";
  import ScreenForm from "@/components/mobile-apps/mobile-designer/ScreenForm";

  const {mapState, mapMutations, mapActions} = createNamespacedHelpers('mobileDesigner');

  export default {
    name: "ScreensList",

    components: {
      'modal-screen-settings': ScreenForm,
    },

    data() {
      return {
        screenTypes,
        screenKey: randStr(5),
        elementSettingsKey: randStr(5),
        elem: {},
        elementModal: {
          visible: false,
          modal: '',
          item: ''
        },
      }
    },

    computed: {
      ...mapState({
        screens: state => state.screens,
        selectedScreenIndex: state => state.selectedScreenIndex,
        screensReady: state => state.screensReady,
        selectedElem: state => state.selectedElem,
        deletedScreens: state => state.deletedScreens,
      })
    },

    methods: {
      ...mapMutations(['setSelectedScreenIndex', 'setDeletedScreens']),

      showElementModal(item, vis) {
        this.elementModal.item = item;
        this.elem = item;
        vis ? this.elementModal.modal = 'modal-screen-settings' : this.elementModal.modal = '';
        this.elementModal.visible = vis;
      },

      saveScreenSettings(d) {
        let s = this.screens.findIndex(x => x.designer_uuid === d.designer_uuid);
        if (s > -1) {
          if (d.is_main)
            for (let i = 0; i < this.screens.length; i += 1)
              this.screens[i].is_main = false;
          this.$set(this.screens, s, d)
        }
        this.showElementModal('', false);
      },

      createNewScreen(type) {
        this.screens.push(createNewScreen(type));
      },

      delScreen(d) {
        let s = this.screens.findIndex(x => x.designer_uuid === d.designer_uuid);
        if (s > -1)
          this.setDeletedScreens(this.deletedScreens.concat(this.screens.splice(s, 1)));
        //TODO: Delete screen from server on save
        this.showElementModal('', false);
        const mainScreenIndex = this.screens.findIndex(s => s.is_main)
        this.setSelectedScreenIndex(mainScreenIndex -1 ? 0 : mainScreenIndex)
      },
    }
  }
</script>
