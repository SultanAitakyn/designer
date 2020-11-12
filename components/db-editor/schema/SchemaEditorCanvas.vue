<template>
  <div class="editor-canvas-container" oncontextmenu="return false;">
    <canvas id="editor-canvas" />
    <CanvasMenu
      v-if="menuPosition && isMenuVisible"
      @select="onSelect"
      :position="menuPosition"
    >
      <a-menu-item key="create-model" v-if="!currentEntity"
        >Create empty model</a-menu-item>
      <a-menu-item key="create-model-template" v-if="!currentEntity" :disabled="true"
      >Create model from template</a-menu-item>

      <a-menu-item
        key="create-relation"
        v-if="!currentEntity"
        :disabled="schema.length < 2"
        >Create relation</a-menu-item
      >

      <a-menu-item key="edit-field"
                   v-if="currentField"
                   :disabled="currentField.generated">
        Edit field
      </a-menu-item>
      <a-menu-item key="delete-field"
                   :disabled="currentField.generated"
                   v-if="currentField"
                   style="color: #f5222d;">
        Delete field
      </a-menu-item>
      <a-menu-item key="edit-model" v-if="currentModel || currentField"
                   :disabled="currentEntity.module_model_id!==undefined || (currentField ? currentField.model.module_model_id!==undefined : false)">
        Edit model
      </a-menu-item>
      <a-menu-item
        key="delete-model"
        :disabled="currentEntity.module_model_id!==undefined || (currentField ? currentField.model.module_model_id!==undefined : false)"
        v-if="currentModel || currentField"
        style="color: #f5222d;">
        Delete model
      </a-menu-item>
      <a-menu-item key="edit-relation" v-if="currentRelation">
        Edit relation
      </a-menu-item>
      <a-menu-item
        key="delete-relation"
        v-if="currentRelation"
        style="color: #f5222d;"
        >Delete relation</a-menu-item
      >
    </CanvasMenu>
    <ModelForm
      v-if="currentModel && !menuPosition"
      :model="currentModel"
      @submit="update"
      @close="close"
    />
    <FieldForm
      v-if="(currentField || infoForNewField) && !menuPosition"
      :field="currentField"
      :position="infoForNewField"
      @submit="update"
      @close="close"
    />
    <RelationForm
      v-if="currentRelation && !menuPosition"
      :relation="currentRelation"
      @submit="update"
      @close="close"
    />
    <a-modal
      title="Create new model"
      v-model="isNewModelFormOpen"
      v-if="isNewModelFormOpen"
      :footer="null"
    >
      <ModelForm :modal="true" @close="close" @submit="createModel" />
    </a-modal>
    <a-modal
      title="Create new relation"
      v-model="isNewRelationFormOpen"
      :footer="null"
      :width="470"
    >
      <RelationForm
        :modal="true"
        @close="close"
        @submit="createRelation"
        v-if="isNewRelationFormOpen"
      />
    </a-modal>
  </div>
</template>

<script>
import paper from "paper";
import { Modal } from "ant-design-vue";
import { Model } from "../model/Model";
import { Relation } from "../relation/Relation";
import { Field } from "../field/Field";
import ModelForm from "../model/ModelForm";
import FieldForm from "../field/FieldForm";
import RelationForm from "../relation/RelationForm";
import { ViewZoom } from "@/components/shared/canvas/ViewZoom";
import CanvasMenu from "@/components/shared/canvas/CanvasMenu";
import uuidv4 from "uuid/v4";
import {makeUuid} from "@/utils/common";

export default {
  name: "SchemaEditorCanvas",
  components: { CanvasMenu, FieldForm, ModelForm, RelationForm },
  data() {
    return {
      canvas: null,
      windowResizeEvent: null,
      currentModel: null,
      currentField: null,
      currentRelation: null,
      infoForNewField: null,
      isNewModelFormOpen: false,
      isNewRelationFormOpen: false,
      isMenuVisible: true
    };
  },
  computed: {
    schema() {
      return this.$store.getters.getSchema;
    },
    currentEntity: {
      get() {
        return this.$store.getters.getCurrentEntity;
      },
      set(newCurrentEntity) {
        this.$store.commit("setCurrentEntity", newCurrentEntity);
      }
    },
    dimensions() {
      return this.schema.dimensions;
    },
    menuPosition: {
      get() {
        const menuPosition = this.$store.getters.getMenuPosition;
        const position = menuPosition
          ? paper.project.view.matrix.transform(menuPosition)
          : null;
        if (menuPosition) {
          this.schema.adjustDimensions({
            x: position.x + 120,
            y: position.y + 300
          });
        }
        return position;
      },
      set(newMenuPosition) {
        this.$store.commit("setMenuPosition", newMenuPosition);
      }
    },
    models() {
      return this.schema.models;
    }
  },
  methods: {
    close() {
      this.currentEntity = null;
      this.isNewModelFormOpen = false;
      this.isNewRelationFormOpen = false;
      this.menuPosition = null;
    },
    update(data) {
      if (this.currentField || this.currentModel || this.currentRelation) {
        this.currentEntity.changeValues(data);
      } else {
        const field = new Field(
          uuidv4(),
          this.schema,
          this.infoForNewField.model,
          data.name,
          data.comment,
          data.type,
          data.array_field_type,
          data.generated,
          data.default_value,
          data.not_null,
          data.unique,
          data.index,
          1,
          data.enum_values,
          data.enum_id,
        );
        this.infoForNewField.model.addField(field);
      }
    },
    deleteModel() {
      this.schema.removeModel(
        this.currentModel
          ? this.currentModel.name
          : this.currentField.model.name
      );
      this.close();
    },
    deleteField() {
      this.currentField.model.removeField(this.currentField.name);
      this.close();
    },
    deleteRelation() {
      this.currentRelation.destroy();
      this.currentRelation.source.removeRelation(this.currentRelation.id, this.currentRelation.sourceFieldName);
      this.currentRelation.target.removeRelation(this.currentRelation.id, this.currentRelation.targetFieldName);
      this.close();
    },
    onSelect(key) {
      if (
        (key === "edit-model" || key === "delete-model") &&
        this.currentEntity instanceof Field
      ) {
        this.currentEntity = this.currentEntity.model;
      }
      if (
        key === "edit-field" ||
        key === "edit-model" ||
        key === "edit-relation"
      ) {
        this.menuPosition = null;
      }
      if (key === "create-model") {
        this.openCreateModelForm();
        this.isMenuVisible = false;
      }
      if (key === "create-relation") {
        this.openCreateRelationForm();
        this.isMenuVisible = false;
      }
      if (
        key === "delete-model" ||
        key === "delete-field" ||
        key === "delete-relation"
      ) {
        let message, action;
        this.isMenuVisible = false;
        switch (key) {
          case "delete-model": {
            message = `Do you really want to delete model "${
              this.currentModel
                ? this.currentModel.name
                : this.currentField.model.name
            }"?`;
            action = this.deleteModel;
            break;
          }
          case "delete-field": {
            message = `Do you really want to delete field "${this.currentField.name}"?`;
            action = this.deleteField;
            break;
          }
          case "delete-relation": {
            message = `Do you really want to delete this relation between "${this.currentRelation.source.name}" and "${this.currentEntity.target.name}"?`;
            action = this.deleteRelation;
            break;
          }
        }
        Modal.confirm({
          title: message,
          content: "This action cannot be undone",
          onOk: () => action()
        });
      }
    },
    openCreateModelForm() {
      this.isNewModelFormOpen = true;
      this.isNewRelationFormOpen = false;
      this.currentEntity = null;
    },
    openCreateRelationForm() {
      if (Object.keys(this.schema).length > 1) {
        this.isNewRelationFormOpen = true;
        this.isNewModelFormOpen = false;
        this.currentEntity = null;
      }
    },
    createModel(data) {
      const model = new Model(
        uuidv4(),
        this.schema,
        data.name,
        data.comment,
        parseInt(this.$store.getters.getMenuPosition.x, 10),
        parseInt(this.$store.getters.getMenuPosition.y),
        data.color,
        data.module_model_id,
        data.relation_options,
      );
      if (model.comment === "") {
        delete model.comment;
      }
      this.schema.addModel(model,true);
      this.isMenuVisible = true;
    },
    createRelation(data) {
      //prepare fields for relation

      this.schema.models[data.source.name].addField(
        new Field(
          uuidv4(),
          this.schema,
          this.schema.models[data.source.name],
          data.sourceFieldName,
          'System generated relation field',
          data.type===1 ? 5 : 6,
          (data.type===1 ? 5 : 6)===6 ? 5 : 0,
          true,
          null,
          false,
          false,
          false,
          1,
          [])
      );

      this.schema.models[data.target.name].addField(
        new Field(
          uuidv4(),
          this.schema,
          this.schema.models[data.target.name],
          data.targetFieldName,
          'System generated relation field',
          data.type===3 ? 6 : 5,
          (data.type===3 ? 6 : 5)===6 ? 5 : 0,
          true,
          null,
          false,
          false,
          false,
          1,
          [])
      );

      const relation = new Relation(
        makeUuid(),
        this.schema,
        this.schema.models[data.source.name],
        this.schema.models[data.target.name],
        data.type,
        data.sourceFieldName,
        data.targetFieldName
      );
      this.schema.models[data.source.name].addRelation(relation);
      this.schema.models[data.target.name].addRelation(relation);
      this.isMenuVisible = true;
    }
  },
  watch: {
    currentEntity(newEntity) {
      if (newEntity) {
        this.isNewModelFormOpen = false;
        this.isNewRelationFormOpen = false;
        if (newEntity instanceof Model) {
          this.currentModel = newEntity;
          this.currentField = null;
          this.currentRelation = null;
          this.infoForNewField = null;
          this.color = newEntity.color;
        } else if (newEntity instanceof Field) {
          this.currentModel = null;
          this.currentField = newEntity;
          this.currentRelation = null;
          this.infoForNewField = null;
        } else if (newEntity instanceof Relation) {
          this.currentModel = null;
          this.currentField = null;
          this.currentRelation = newEntity;
          this.infoForNewField = null;
        } else {
          this.currentModel = null;
          this.currentField = null;
          this.currentRelation = null;
          this.infoForNewField = newEntity;
        }
      } else {
        this.currentModel = null;
        this.currentField = null;
        this.currentRelation = null;
        this.infoForNewField = null;
      }
    },
    dimensions: {
      handler(newDimensions) {
        paper.project.view.viewSize.width = newDimensions.x;
        paper.project.view.viewSize.height = newDimensions.y;
      },
      deep: true
    },
    menuPosition(newPosition) {
      if (newPosition) {
        this.isNewModelFormOpen = false;
        this.isNewRelationFormOpen = false;
        this.isMenuVisible = true;
      }
    }
  },
  mounted() {
    this.canvas = document.getElementById("editor-canvas");
    this.canvas.parentElement.style.height =
      window.innerHeight - this.canvas.parentElement.offsetTop - 96 + "px";
    this.schema.dimensions = {
      x: Math.max(
        parseInt(this.canvas.parentElement.offsetWidth, 10),
        this.canvas.width,
        this.schema.dimensions.x
      ),
      y: Math.max(
        parseInt(this.canvas.parentElement.style.height, 10),
        this.schema.dimensions.y
      )
    };
    paper.setup(this.canvas);
    paper.project.currentStyle.strokeWidth = 1;
    paper.project.currentStyle.strokeColor = "#000";
    paper.project.currentStyle.fontFamily =
      "Helvetica,Arial,sans-serif";
    paper.project.currentStyle.fontSize = 12;
    paper.project.view.update();
    new ViewZoom(paper.project, this.schema);
    paper.project.view.onClick = event => {
      if (event.event.button === 2) {
        this.menuPosition = event.point;
      }
    };
  },
  beforeDestroy() {
    this.close();
    paper.project.remove();
  }
};
</script>
<style scoped>
  .canvas-context-menu{
    width: 230px;
  }
</style>
