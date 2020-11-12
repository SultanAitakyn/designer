<template>
  <a-modal
    :visible="visible"
    :title="`${widgetId ? 'Edit' : 'Create'} user template`"
    :confirm-loading="loading"
    @ok="saveUserTemplateModal"
    @cancel="() => $emit('close')"
    width="390px"
    destroy-on-close
  >
    <a-form-model
      layout="vertical"
      ref="userTemplateForm"
      :model="userTemplateFormModel"
      :rules="userTemplateFormRules"
    >
      <a-form-model-item label="name" prop="name">
        <a-input v-model="userTemplateFormModel.name"/>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
  import {mapActions, mapState} from "vuex";
  import {createUserTemplate, getUserTemplate, updateUserTemplate} from "@/requests/MobileApps";


  export default {
    name: "UserTemplateFormModal",

    props: {
      visible: Boolean,
      widgetId: String
    },

    data() {
      return {
        fetching: true,
        loading: false,
        userTemplateFormModel: {
          name: ''
        },
        userTemplateFormRules: {
          name: [{required: true, message: 'name is required', trigger: 'blur'}]
        },
      }
    },

    computed: {
      ...mapState('mobileDesigner', ['app', 'selectedElem'])
    },

    created() {
      if (this.widgetId) {
        getUserTemplate(this.app.id, this.widgetId).then(res => {
          this.userTemplateFormModel = res
          this.fetching = false
        })
      } else {
        this.userTemplateFormModel = {
          name: '',
          model: this.selectedElem
        }
      }
    },

    methods: {
      ...mapActions('mobileDesigner', ['fetchUserTemplates']),

      saveUserTemplateModal() {
        this.loading = true
        this.$refs.userTemplateForm.validate(valid => {
          if (valid) {
            (this.widgetId ? updateUserTemplate(this.app.id, this.widgetId, this.userTemplateFormModel) : createUserTemplate(this.app.id, this.userTemplateFormModel))
              .then(
                () => {
                  this.$message.success(`User template "${this.userTemplateFormModel.name}" saved!`)
                  this.$emit('close')
                  this.fetchUserTemplates()
                },
                err => this.$message.error(err)
              )
              .finally(() => this.loading = false)
          } else {
            this.loading = false
            return false
          }
        })
      },
    }
  }
</script>
