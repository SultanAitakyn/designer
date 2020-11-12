<template>
  <div>
    <!--    <a-input-search placeholder="Search widgets" style="margin-bottom: 8px;"/>-->
    <a-collapse accordion defaultActiveKey="1" :bordered="false">
      <a-collapse-panel key="1">
        <span slot="header" style="padding-top: 8px; padding-bottom: 8px;">General</span>

        <draggable
          :list="getWidgets(['stack', 'general'])"
          :group="{ name: 'elements', pull: 'clone', put: false }"
          :sort="false"
          :clone="handleClone"
          style="display: grid; grid-template-columns: repeat(2, 50%);"
        >
          <div
            class="element-item"
            v-for="(item, index) in getWidgets(['general'])"
            :key="index"
            :data-elem-type="item.type"
          >
            <a-icon :type="item.icon" :style="{ fontSize: '15px', color: '#08c' }"/>
            <p>{{ item.label }}</p>
          </div>
        </draggable>
      </a-collapse-panel>

      <a-collapse-panel key="2">
        <span slot="header">Form</span>

        <draggable
          :list="getWidgets(['form'])"
          :group="{ name: 'form', pull: 'clone', put: false }"
          :sort="false"
          :clone="handleClone"
          style="display: grid; grid-template-columns: repeat(2, 50%);"
        >
          <div
            class="element-item"
            v-for="(item, index) in getWidgets(['form'])"
            :key="index"
            :data-elem-type="item.type"
          >
            <a-icon :type="item.icon" :style="{ fontSize: '15px', color: '#08c' }"/>
            <p>{{ item.label }}</p>
          </div>
        </draggable>
      </a-collapse-panel>

      <a-collapse-panel key="3">
        <span slot="header">Templates</span>

        <draggable
          :list="getWidgets(['templates'])"
          :group="{ name: 'elements', pull: 'clone', put: false }"
          :sort="false"
          :clone="handleClone"
          style="display: grid; grid-template-columns: repeat(2, 50%);"
        >
          <div
            class="element-item"
            v-for="(item, index) in getWidgets(['templates'])"
            :key="index"
            :data-elem-type="item.type"
          >
            <a-icon :type="item.icon" :style="{ fontSize: '15px', color: '#08c' }"/>
            <p>{{ item.label }}</p>
          </div>
        </draggable>
      </a-collapse-panel>

      <template
        v-for="(userTemplates, userTemplatesGroupName) in userTemplatesGroups"
      >
        <a-collapse-panel
          :key="userTemplatesGroupName"
          v-if="userTemplates.length"
        >
          <span slot="header">{{ userTemplatesGroupName }}</span>

          <draggable
            :list="userTemplates"
            :group="{ name: 'elements', pull: 'clone', put: false }"
            :sort="false"
            :clone="handleClone"
            style="display: grid; grid-template-columns: repeat(2, 50%);"
          >
            <div
              class="element-item"
              v-for="(userTemplate, index) in userTemplates"
              :key="index"
              :data-elem-type="userTemplate.model.type"
            >
              <p style="font-weight: 500;">{{ userTemplate.name }}</p>
              <a href="#" @click.prevent="openUserTemplateFormModal(userTemplate.id)" style="margin-right: 8px;">
                <a-icon type="edit"/>
              </a>
              <a href="#" @click.prevent="deleteUserTemplate(userTemplate)" style="color: #ff4d4f">
                <a-icon type="delete"/>
              </a>
            </div>
          </draggable>
        </a-collapse-panel>
      </template>
    </a-collapse>

    <!--<a-modal
      title="Rename user template"
      v-model="userTemplateFormModalVisible"
      :confirm-loading="userTemplateFormModalLoading"
      @ok="saveUserTemplateModal"
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
    </a-modal>-->

    <UserTemplateFormModal
      v-if="userTemplateFormModalVisible"
      :visible="userTemplateFormModalVisible"
      :widget-id="userTemplateFormModalWidgetId"
      @close="closeUserTemplateFormModal"
    />
  </div>
</template>

<script>
  import cloneDeep from "lodash-es/cloneDeep";
  import {mapActions, mapState} from "vuex";
  import draggable from "vuedraggable";
  import {deleteUserTemplate, updateUserTemplate} from "@/requests/MobileApps";
  import {makeUuid} from "@/utils/common";
  import {widgetTypes, createNewElement} from "@/utils/mautils";
  import UserTemplateFormModal from "@/components/mobile-apps/mobile-designer/UserTemplateFormModal";


  export default {
    name: "WidgetsLibrary",

    components: {
      draggable,
      UserTemplateFormModal
    },

    data() {
      return {
        userTemplateFormModalVisible: false,
        userTemplateFormModalWidgetId: '',
      }
    },

    computed: {
      ...mapState('mobileDesigner', {
        userTemplatesGroups: state => state.userTemplates
      }),
    },

    methods: {
      ...mapActions('mobileDesigner', ['fetchUserTemplates']),

      getWidgets(group) {
        return widgetTypes.filter(x => group.includes(x.group));
      },

      openUserTemplateFormModal(widgetId) {
        this.userTemplateFormModalVisible = true
        this.userTemplateFormModalWidgetId = widgetId
      },

      closeUserTemplateFormModal() {
        this.userTemplateFormModalVisible = false
        this.userTemplateFormModalWidgetId = ''
      },

      deleteUserTemplate(template) {
        this.$confirm({
          title: `Delete user template "${template.name}"?`,
          okText: 'Delete',
          okType: 'danger',
          onOk: () => {
            deleteUserTemplate(this.$route.params.id, template.id).then(() => {
              this.$message.success(`"${template.name}" deleted`)
              this.fetchUserTemplates()
            }, err => this.$message.error(err))
          },
        })
      },

      handleClone: element => {
        let newElement;
        if (element.name) {
          newElement = cloneDeep(element.model);
          newElement.model.key = makeUuid();
          const deepForEach = children => {
            if (children && children.length) {
              children.forEach(c => {
                c.model.key = makeUuid();
                deepForEach(c.model.children)
              })
            }
          }
          deepForEach(newElement.model.children)
        } else {
          newElement = createNewElement(element.type);
          newElement.model.key = makeUuid();
        }
        return newElement;
      }
    }
  };
</script>

<style scoped>
  .ant-collapse-header {
    height: 30px;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .element-item {
    text-align: center;
    flex: 0 0 23.6%;
    margin: 5px;
    border: 1px dashed #0088cc;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;
  }

  .element-item p {
    margin: 0;
  }

  .ant-collapse-item:last-child {
    border-bottom: none;
  }

</style>
