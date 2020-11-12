import localForage from "localforage";
import { cloneDeep } from "lodash-es";
import uuidv4 from "uuid/v4";
import { Model } from "../model/Model";
import { Field } from "@/components/db-editor/field/Field";
import { Relation } from "@/components/db-editor/relation/Relation";
import store from "@/store";

export class Schema {
  constructor(title, version, id) {
    this.reset(title, version, id);
  }

  destroyModels() {
    for (const model in this.models) {
      if (this.models.hasOwnProperty(model)) {
        this.models[model].destroy();
      }
    }
  }

  reset(title, version, id, dimensions = { x: 0, y: 0 }) {
    this.destroyModels();
    this.title = title;
    this.version = version;
    this.id = id;
    this.models = {};
    this.length = 0;
    this.dimensions = dimensions;
  }

  importFromJson(json, id, deleteAfter = true) {
    store.commit("setImportingStatus", true);
    this.reset(json.title, json.version, id, this.dimensions);
    store.commit("setLoading", true);
    if (json.hasOwnProperty("models")) {
      for (let i = 0; i < json.models.length; ++i) {
        const model = new Model(
          json.models[i].id ? json.models[i].id : uuidv4(),
          this,
          json.models[i].name,
          json.models[i].comment,
          json.models[i].left,
          json.models[i].top,
          json.models[i].color ? json.models[i].color : "#000",
          json.models[i].module_model_id,
          json.models[i].relation_options
        );
        this.addModel(model, false);
        if (json.models[i].hasOwnProperty("fields")) {
          for (let j = 0; j < json.models[i].fields.length; ++j) {
            this.models[json.models[i].name].addField(
              new Field(
                json.models[i].fields[j].id
                  ? json.models[i].fields[j].id
                  : uuidv4(),
                this,
                this.models[json.models[i].name],
                json.models[i].fields[j].name,
                json.models[i].fields[j].comment,
                json.models[i].fields[j].type,
                json.models[i].fields[j].array_field_type,
                json.models[i].fields[j].generated,
                json.models[i].fields[j].default_value,
                json.models[i].fields[j].not_null,
                json.models[i].fields[j].unique,
                json.models[i].fields[j].index,
                json.models[i].fields[j].default_order,
                json.models[i].fields[j].enum_values,
                json.models[i].fields[j].enum_id
              )
            );
          }
        }
      }
      setTimeout(() => store.commit("setProgress", 80), 10);
    }
    if (json.hasOwnProperty("relations")) {
      for (let i = 0; i < json.relations.length; ++i) {
        const from =
          json.models[
            json.models.findIndex(m =>
              json.relations[i].from_model !== undefined
                ? m.id === json.relations[i].from_model
                : m.id === json.relations[i].from_model_id
            )
          ];
        const to =
          json.models[
            json.models.findIndex(m =>
              json.relations[i].from_model !== undefined
                ? m.id === json.relations[i].to_model
                : m.id === json.relations[i].to_model_id
            )
          ];
        if (from && to) {
          const relation = new Relation(
            json.relations[i].id,
            this,
            this.models[from.name],
            this.models[to.name],
            json.relations[i].type,
            json.relations[i].from_field_name,
            json.relations[i].to_field_name,
            json.relations[i].options ? json.relations[i].options : []
          );
          this.models[from.name].addRelation(relation);
          this.models[to.name].addRelation(relation);
        }
      }
    }
    if (deleteAfter) {
      this.removeSave();
    }
    store.commit("setLoading", false);
    store.commit("setImportingStatus", false);
    setTimeout(() => store.commit("setProgress", 100), 20);
    setTimeout(() => store.commit("setProgress", 101), 1000);
  }

  addModel(model = new Model(uuidv4(), this, uuidv4(), 0, 0), addSystem) {
    if (!this.models.hasOwnProperty(model.name)) {
      this.models[model.name] = model;
      ++this.length;
      if (addSystem) {
        //system: ID
        this.models[model.name].addField(
          new Field(
            uuidv4(),
            this,
            this.models[model.name],
            'ID',
            'System generated field',
            1,
            0,
            true,
            null,
            false,
            false,
            false,
            1,
            [])
        );
        //system CreatedAt
        this.models[model.name].addField(
          new Field(
              uuidv4(),
              this,
              this.models[model.name],
              'CreatedAt',
              'System generated field',
              4,
              0,
              true,
              null,
              false,
              false,
              false,
              2,
            [])
        );
        //system UpdatedAt
        this.models[model.name].addField(
          new Field(
            uuidv4(),
            this,
            this.models[model.name],
            'UpdatedAt',
            'System generated field',
            4,
            0,
            true,
            null,
            false,
            false,
            false,
            3,
            [])
        );
        //system DeletedAt
        this.models[model.name].addField(
          new Field(
            uuidv4(),
            this,
            this.models[model.name],
            'DeletedAt',
            'System generated field',
            4,
            0,
            true,
            null,
            false,
            false,
            false,
            4,
            [])
        );
      }

      this.adjustDimensions(model.canvasElement.group.bounds.bottomRight);
      this.saveLocally();
    }
  }

  removeModel(key) {
    if (this.models.hasOwnProperty(key)) {
      const currModel = this.models[key];
      if (currModel) {
        for (const relationKey in currModel.relations) {
          if (currModel.relations && currModel.relations.hasOwnProperty(relationKey)) {
            const relation = currModel.relations[relationKey];
            relation.target.removeField(relation.targetFieldName);
            relation.source.removeField(relation.sourceFieldName);
          }
        }
      }

      this.models[key].destroy();
      delete this.models[key];
      --this.length;
      this.saveLocally();
    }
  }

  exportAsJson() {
    const schema = cloneDeep(this);
    delete schema.id;
    delete schema.length;
    delete schema.dimensions;
    schema.models = Object.values(schema.models);
    const relations = [];
    for (let i = 0; i < schema.models.length; ++i) {
      delete schema.models[i].schema;
      delete schema.models[i].canvasElement;
      schema.models[i].fields = Object.values(schema.models[i].fields);
      schema.models[i].relations = Object.values(schema.models[i].relations);
      schema.models[i].validators = Object.values(schema.models[i].validators);
      schema.models[i].permissions = Object.values(schema.models[i].permissions);
      for (let j = 0; j < schema.models[i].fields.length; ++j) {
        delete schema.models[i].fields[j].canvasElement;
        delete schema.models[i].fields[j].schema;
        delete schema.models[i].fields[j].model;
        // TODO: temporary
        delete schema.models[i].fields[j].validators;
      }
      for (let j = schema.models[i].relations.length - 1; j >= 0; --j) {
        if (schema.models[i].relations[j].source.id === schema.models[i].id) {
          relations.push({
            id: schema.models[i].relations[j].id,
            from_model_id: schema.models[i].relations[j].source.id,
            to_model_id: schema.models[i].relations[j].target.id,
            from_field_name: schema.models[i].relations[j].sourceFieldName,
            to_field_name: schema.models[i].relations[j].targetFieldName,
            type: schema.models[i].relations[j].type,
            options: schema.models[i].relations[j].options ? schema.models[i].relations[j].options : null
          });
        }
      }
      delete schema.models[i].relations;
      // TODO: temporary
      delete schema.models[i].validators;
      delete schema.models[i].permissions;
    }
    if (relations.length) {
      schema.relations = relations;
    }
    return schema;
  }

  saveLocally() {
    if (!store.getters.getImportingStatus) {
      localForage.setItem(
        `appmaster-db-schema-(${this.id})`,
        JSON.stringify(this.exportAsJson())
      );
    }
  }

  removeSave() {
    localForage.removeItem(`appmaster-db-schema-(${this.id})`);
  }

  adjustDimensions(dimensions) {
    this.dimensions.x = Math.max(dimensions.x, this.dimensions.x);
    this.dimensions.y = Math.max(dimensions.y, this.dimensions.y);
  }
}
