<template>
  <div>
    <a-dropdown :trigger="['click']">
      <a-menu slot="overlay">
        <a-menu-item key="1" disabled>
          <a-icon type="file"/>
          Reset to default
        </a-menu-item>
        <a-menu-item key="2" disabled>
          <a-icon type="book"/>
          Load demo
        </a-menu-item>
        <a-menu-item key="3" disabled>
          <a-icon type="cloud-upload"/>
          Import
        </a-menu-item>
        <a-menu-item key="4" @click="downloadObjectAsJson('screens')">
          <a-icon type="cloud-download"/>
          Export
        </a-menu-item>
        <a-menu-item key="5" @click="configModal.visible = true">
          <a-icon type="edit"/>
          Live edit
        </a-menu-item>
      </a-menu>
      <a-button size="small">Configuration
        <a-icon type="down"/>
      </a-button>
    </a-dropdown>

    <a-button
      @click="saveModel"
      type="primary"
      :loading="saveLoader"
      size="small"
      style="margin-left: 8px;"
    >
      {{ saveLoader ? 'Saving..' : 'Save' }}
    </a-button>

    <MobileAppModelEditor
      :visible="configModal.visible"
      @close="()=> {configModal.visible = false}"
    />
  </div>
</template>

<script>
  import {addScreen, deleteScreen, updateScreen} from "@/requests/MobileApps";
  import MobileAppModelEditor from "@/components/mobile-apps/mobile-designer/MobileAppModelEditor";
  import {mapGetters, mapMutations, mapState} from "vuex";


  export default {
    name: "MobileAppControls",

    components: {
      MobileAppModelEditor,
    },

    data() {
      return {
        saveLoader: false,
        requestsInProgress: 0,
        configModal: {
          visible: false,
          values: {},
        },
      }
    },

    computed: {
      ...mapState('mobileDesigner', {
        screens: state => state.screens,
        deletedScreens: state => state.deletedScreens
      }),
      ...mapGetters('mobileDesigner', ['getScreenById'])
    },

    methods: {
      ...mapMutations('mobileDesigner', ['setDeletedScreens']),

      downloadObjectAsJson(exportName) {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.$store.state.mobileDesigner));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      },

      saveModel() {
        //TODO: Make more
        //Save all screens
        this.requestsInProgress = 0; //Track active requests
        this.validateScheme(true);
        this.saveLoader = true;
        for (let i = 0; i < this.screens.length; i++) {
          this.$store.commit("setLoading", true);

          if (this.screens[i].id) {
            this.requestsInProgress++;
            updateScreen(this.screens[i])
              .then(() => {
              }, err => this.$message.error(this.screens[i].name + ' saving error!'))
              .finally(() => {
                this.requestsInProgress--;
                if (this.requestsInProgress < 1) {
                  this.saveLoader = false
                  this.$store.commit("setLoading", false);
                  this.$store.commit(
                    "setSuccessMessage",
                    "Scheme was successfully updated"
                  );
                }
              });
          } else {
            this.requestsInProgress++;
            addScreen(this.$route.params.id, this.screens[i])
              .then(res => {
                if (res && res.status === "success") {
                  //Mark as created screen
                  this.getScreenById(res.id).id = res.id
                }
              })
              .finally(() => {
                this.requestsInProgress--;
                if (this.requestsInProgress < 1) {
                  this.saveLoader = false
                  this.$store.commit("setLoading", false);
                  this.$store.commit(
                    "setSuccessMessage",
                    "Scheme was successfully updated"
                  );
                }
              });
          }
        }

        //Delete deleted
        for (let i = 0; i < this.deletedScreens.length; i++) {
          //TODO: (!!!) Change algorithm to delete after successful delete request
          if (this.deletedScreens[i].id) {
            this.requestsInProgress++;
            deleteScreen(this.deletedScreens[i].id)
              .then(() => {
              }, err => this.$message.error(err))
              .finally(() => {
                this.requestsInProgress--;
                if (this.requestsInProgress < 1) {
                  this.setDeletedScreens([])
                  this.saveLoader = false
                  this.$store.commit("setLoading", false);
                  this.$store.commit(
                    "setSuccessMessage",
                    "Scheme was successfully updated"
                  );
                }
              })
          } else {
            if (this.requestsInProgress < 1) {
              this.setDeletedScreens([])
              this.saveLoader = false
              this.$store.commit("setLoading", false);
              this.$store.commit(
                "setSuccessMessage",
                "Scheme was successfully updated"
              );
            }
          }
        }
      },

      validateScheme(fix) {
        // 1.Check Bottom Nav Bar elements actions for deleted screens
        let bnbscreens = this.screens.filter(s => s.model.type === 8);
        for (let i = 0; i < bnbscreens.length; i += 1)
          for (let c = 0; c < bnbscreens[i].model.model.children.length; c += 1) {
            if (bnbscreens[i].model.model.children[c].model.actions) {
              let trg = bnbscreens[i].model.model.children[c].model.actions.find(a => a.trigger === 11 && a.type === 1);//find because there are only one trigger 11 can exist
              if (trg && trg.screen && trg.screen.model && trg.screen.model.key && !this.screens.find(s => s.model.model.key === trg.screen.model.key))
                trg.screen.model.key = null;
            }
          }
      },
    }
  }
</script>
