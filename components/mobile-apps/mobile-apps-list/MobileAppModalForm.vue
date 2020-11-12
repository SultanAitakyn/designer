<template>
  <a-modal
    :visible="visible"
    :title="mobileAppId ? 'Edit application' : 'New application'"
    :okText="mobileAppId ? 'Save' : 'Create'"
    @ok="saveApp"
    @cancel="cancelModal"
    :confirmLoading="loading"
    :width="600"
  >
    <a-spin :spinning="loading">
      <a-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item label="Name" prop="name">
          <a-input
            v-model="form.name"
            placeholder="Application name"
            :maxLength="150"
          />
        </a-form-model-item>

        <a-form-model-item prop="description">
          <template slot="label">
            Description
            <a-tooltip :mouseEnterDelay="1">
              <template slot="title">
                Description will be visible in AppStores and documentation.
              </template>
              <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
            </a-tooltip>
          </template>
          <a-textarea
            v-model="form.description"
            placeholder="Application description (Recommended)"
            :maxLength="400"
            :autoSize="{ minRows: 2, maxRows: 6 }"
          />
        </a-form-model-item>

        <a-form-model-item prop="type">
          <template slot="label">
            Type
            <a-tooltip :mouseEnterDelay="1">
              <template slot="title">
                Define your application strategy - create one application for all platforms or make separate ones.<br/>
                All types are fully native.
              </template>
              <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
            </a-tooltip>
          </template>

          <a-radio-group v-model="form.type" button-style="solid">
            <a-radio-button :value="1">
              <a-tooltip :mouseEnterDelay="1">
                <template slot="title">
                  Same app will be published for every platform. Your design will be adapted to every platform automatically.
                </template>
                <a-icon type="appstore"/>
                Generic
              </a-tooltip>
            </a-radio-button>
            <a-radio-button :value="2" disabled>
              <a-tooltip :mouseEnterDelay="1">
                <template slot="title">
                  Create application, dedicated for Android devices only.
                </template>
                <a-icon type="android"/>
                Android
              </a-tooltip>
            </a-radio-button>
            <a-radio-button :value="3">
              <a-tooltip :mouseEnterDelay="1">
                <template slot="title">
                  Create application, dedicated for Apple IOS devices only.
                </template>
                <a-icon type="apple"/>
                Apple IOS
              </a-tooltip>
            </a-radio-button>
          </a-radio-group>
        </a-form-model-item>

        <a-tabs :animated="false" style="overflow: visible">
          <a-tab-pane key="1" forceRender>
            <span slot="tab">
              <a-icon type="windows"/>
              General
            </span>

            <a-form-model-item prop="colors">
              <template slot="label">
                Color scheme
                <a-tooltip :mouseEnterDelay="1">
                  <template slot="title">
                    Color scheme is useful to centralize color management across application and comply with style code
                  </template>
                  <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
                </a-tooltip>
              </template>

              <MAColorsSetting v-model="form.colors"/>
            </a-form-model-item>

            <a-form-model-item prop="icon">
              <template slot="label">
                Icon
                <a-tooltip :mouseEnterDelay="1">
                  <template slot="title">
                    <a-icon type="warning" theme="twoTone" two-tone-color="#f56a00"/>
                    Icon change will require to republish applications to all AppStores
                  </template>
                  <a-icon type="question-circle" style="font-size: smaller;vertical-align: initial;"/>
                </a-tooltip>
              </template>

              <ImageSetting v-model="form.icon"/>
            </a-form-model-item>
          </a-tab-pane>

          <!--<a-tab-pane key="2" v-if="form.type !== 3">
            <span slot="tab">
              <a-icon type="android"/>
              Android
            </span>

          </a-tab-pane>-->

          <a-tab-pane key="3" v-if="form.type !== 2">
            <span slot="tab">
              <a-icon type="apple"/>
              IOS
            </span>

            <MAIosSettings v-model="form.ios"/>
          </a-tab-pane>
        </a-tabs>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
  import MAColorsSetting from "@/components/mobile-apps/mobile-apps-list/mobile-app-form/MAColorsSetting";
  import MAIosSettings from "@/components/mobile-apps/mobile-apps-list/mobile-app-form/MAIosSettings";
  import ImageSetting from "@/components/mobile-apps/mobile-designer/widget-settings/ImageSetting";
  import {getMobileApp, addMobileApp, updateMobileApp} from "@/requests/MobileApps";
  import {mapActions, mapGetters, mapState} from "vuex";


  export default {
    name: "MobileAppModalForm",

    components: {
      MAIosSettings,
      ImageSetting,
      MAColorsSetting,
    },

    props: {
      visible: Boolean,
      mobileAppId: String,
    },

    data() {
      return {
        loading: false,
        form: {
          name: '',
          description: '',
          icon: '',
          colors: {
            primary: '#303f9f',
            primary_text: '#ffffff',
            accent: '#56ccf2',
            accent_text: '#000000',
          },
          type: 1,
          ios: {
            metadata: {
              locales: [
                {
                  locale: 'en-US',
                  name: '',
                  subtitle: '',
                  description: '',
                  promo: '',
                  release_notes: '',
                  keywords: '',
                  privacy_url: '',
                  marketing_url: '',
                  support_url: '',
                }
              ],
              review: {},
            },
            credentials: {}
          }
        },
        rules: {
          name: [
            {required: true, whitespace: true, message: 'App name required'},
            {validator: this.uniqueNameValidator, message: 'App with the same name already exists'},
          ],
          type: [
            {required: true, message: 'Select application type'},
          ],
        },
      }
    },

    computed: {
      ...mapState('mobileDesigner', ['mobileApps']),
      ...mapGetters('apps', {currentApp: 'current'}),
    },

    mounted() {
      if (this.mobileAppId) {
        this.loading = true;
        getMobileApp(this.mobileAppId)
          .then(res => {
            this.form = res
          }, err => this.$message.error(err.message))
          .finally(() => this.loading = false)
      }
    },

    methods: {
      ...mapActions('mobileDesigner', ['fetchMobileApps']),

      uniqueNameValidator(_, value, callback) {
        if (this.mobileApps.find(mobileApp => {
          return mobileApp.name.toLowerCase() === value.toLowerCase() && this.form.id !== mobileApp.id
        })) {
          callback(new Error("App with the same name already exists"));
          return;
        }
        callback();
      },

      saveApp() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true;
            if (this.mobileAppId) {
              updateMobileApp(this.mobileAppId, this.form)
                .then(
                  res => {
                    if (res.status && res.status === "success") {
                      this.$refs.form.resetFields;
                      this.$emit('closeModal')
                      this.$store.commit(
                        "setSuccessMessage",
                        "Mobile app was successfully updated",
                      );
                      this.fetchMobileApps();
                    }
                  },
                  error => this.$message.error(error)
                )
                .finally(() => this.loading = false)
            } else {
              addMobileApp(this.currentApp.id, this.form)
                .then(
                  res => {
                    if (res.status && res.status === "success") {
                      this.$emit('closeModal')
                      this.$refs.form.resetFields;
                      this.$store.commit(
                        "setSuccessMessage",
                        "Mobile app was successfully created",
                      );
                      this.$gtag.event('mobile_app_created');
                      this.fetchMobileApps();
                    }
                  },
                  error => this.$message.error(error)
                )
                .finally(() => this.loading = false)
            }
          }
        });
      },

      cancelModal() {
        this.$refs.form.resetFields();
        this.$emit('closeModal')
      },
    }
  }
</script>
