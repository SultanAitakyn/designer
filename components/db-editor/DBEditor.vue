<template>
  <a-row>
    <a-row type="flex" justify="center">
      <h2 style="margin-bottom: 0px; flex: 1;">Data Models Designer</h2>
      <div class="progress-bar">
        <a-progress
          v-show="progress !== 101"
          :percent="progress"
          size="small"
          :format="
            progress =>
              progress == 60
                ? 'Loading Entities'
                : progress == 80
                ? 'Loading Relations'
                : progress == 100
                ? 'Success'
                : 'Please, try again'
          "
          style="width:170px; text-align: center;"
        />
      </div>
      <div class="editor-button-container">
        <a-dropdown-button
          style="margin-right: 1rem;"
          v-if="revisions && currentVersion"
        >
          <a-icon type="check-circle" />Current version: {{currentVersion}}
          <a-menu
            slot="overlay"
            :selectedKeys="[currentVersion]"
            @click="handleSelectVersion"
          >
            <a-menu-item>
              <a-icon type="check-circle" />Current version: #{{ currentVersion }}
              {{timeFromNow(revisions[0].created_at)}}
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item v-for="revision in revisions" :key="revision.version">
              <a-icon type="undo" />#{{
                revision.version +
                  " (" +
                  new Date(revision.created_at)
                    .toLocaleString()
                    .replace(/\./g, "/") +
                  ")"
              }}
            </a-menu-item>
          </a-menu>
        </a-dropdown-button>
        <a-button type="primary" @click="save" :loading="loading">Save model</a-button>
      </div>
    </a-row>
    <SchemaEditorCanvas />
    <modal-first-help :isOpen.sync="isShowFirstHelp">
      <div
        title="How to create a model"
        data-description="Data Models Designer - is the main tool to create data models, model's
        priorities, and relations in your project. To create data models go to the designer canvas
        and right-click on the canvas free space to get the context menu. In the context menu click New model."
        data-link="https://docs.appmaster.io/docs/creating-data-models"
        :style="{ backgroundImage: `url(${require('@/assets/img/help/dataDesignCreateModel.gif')})` }"
      />
      <div
        title="How to create a field"
        data-description="Once the data model is created, a few system data fields are created inside. ID, CreatedAt,
        UpdatedAt, and DeletedAt are mandatory fields and designed to track the data model's records lifecycle and changes.
        You cant rename or delete these fields, but can use to build business logic and UI. To create a new field inside of
        the data model press the + button at the bottom of it. In the opened modal window type name and choose the type of new field.
        List of all types available <a href='https://docs.appmaster.io/docs/data-types-list' target='_blank'>here</a>."
        data-link="https://docs.appmaster.io/docs/creating-data-models"
        :style="{ backgroundImage: `url(${require('@/assets/img/help/dataDesignCreateField.gif')})` }"
      />
      <div
        title="How to create a relation"
        data-description="To create a relation between two models draw a line from the border of the first model to the second model. To edit relation left-click on the connection between models."
        data-link="https://docs.appmaster.io/docs/creating-data-models"
        :style="{ backgroundImage: `url(${require('@/assets/img/help/dataDesignCreateRelation.gif')})` }"
      />
    </modal-first-help>
  </a-row>
</template>

<script>
import moment from "moment";
import SchemaEditorCanvas from "./schema/SchemaEditorCanvas";
import {updateSchema, getSchemaRevisions} from "@/requests/Apps";
import ModalFirstHelp from '@/views/main/modals/ModalFirstHelp';

export default {
  name: "DBEditor",
  components: {
    SchemaEditorCanvas,
    ModalFirstHelp,
  },
  props: {
    appId: {
      type: Number,
      default: -1
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      edit: false,
      revisions: [],
      currentVersion: null,
      isShowFirstHelp: !this.$store.getters['tracking/isPageVisited'](this.$route.path),
    };
  },
  computed: {
    currentApp() {
      return this.$store.getters['apps/current'];
    },
    schema() {
      return this.$store.getters.getSchema;
    },
    loading: {
      get() {
        return this.$store.state.loading;
      },
      set(isLoading) {
        this.$store.commit("setLoading", isLoading);
      }
    }
  },
  watch: {
    currentApp: {
      handler(newApp, oldApp) {
        if (newApp.id !== oldApp.id) {
          this.refetchSchemaRevisions();
        }
      },
    }
  },
  methods: {
    refetchSchemaRevisions() {
      getSchemaRevisions(this.appId).then(response => {
        this.revisions = response.data;
        this.currentVersion = response.data[0].version;
      })
    },
    showEdit() {
      this.edit = true;
    },
    hideEdit() {
      this.edit = false;
    },
    save() {
      this.loading = true;
      updateSchema(this.appId, this.schema.exportAsJson()).then((res) => {
        this.schema.removeSave();
        this.schema.importFromJson(res, this.currentApp.id);
        this.$store.commit(
          "setSuccessMessage",
          "Schema was saved successfully"
        );
        this.refetchSchemaRevisions();
      }).catch(e => {
        this.$message.error('Save Error')
      }).then(() => {
          this.loading = false;
        });
    },
    handleSelectVersion(e) {
      if (typeof e.key === "number" && e.key !== this.currentVersion) {
        this.currentVersion = e.key;
        this.$emit("get-version", e.key);
      }
    },
    timeFromNow(date) {
      return moment(date).fromNow();
    },
    showFirstHelp() {
      this.isShowFirstHelp = true;
    },
  },
  updated() {
    if (this.edit) {
      document.getElementById("schema-title-input").focus();
    }
  },
  created() {
    this.$root.$on('showFirstHelp', this.showFirstHelp);
  },
  beforeMount() {
    this.refetchSchemaRevisions();
  },
  beforeDestroy() {
    this.$root.$off('showFirstHelp', this.showFirstHelp);
  }
};
</script>

<style scoped>
.editor-title:hover {
  background-color: #bfbfbf;
  display: inline-block;
  cursor: pointer;
}

.editor-button-container {
  display: flex;
  flex: 1;
  justify-content: flex-end;
}

.progress-bar {
  flex: 1;
  display: flex;
  justify-content: center;
}
</style>
