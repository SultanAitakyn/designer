import localForage from "localforage";
import uuidv4 from "uuid/v4";
import { cloneDeep } from "lodash-es";
import { Block, BlockType } from "../block/Block";
import { Link } from "../link/Link";
import store from "@/store";
import Vue from "vue";
import { ElementsDrawParams } from "@/components/bp-editor/block/blocks/ElementsParams";
import { Fields } from "../fields/Fields";
import { Render } from "./Render";

const fieldTypeModel = 5;

export const SchemaType = Object.freeze({
  CREATE: 1,
  UPDATE: 2,
  DELETE: 3,
  GET_ONE: 4,
  SEARCH: 5,
  MODULE: 6,
  CUSTOM: 7
});

export class Schema {
  constructor(name, version, id, type, params = null) {
    this.reset(name, version, id, type, params);
    const start = new Block(uuidv4(), "start", BlockType.START);
    const end = new Block(uuidv4(), "end", BlockType.END);
    store.commit("setImportingStatus", true);
    this.addBlock(end);
    this.addBlock(start);
    this.addLink(new Link(start, end), true);
    store.commit("setImportingStatus", false);
  }

  reset(name, version, id, type, params) {
    if (type >= 1 && type <= 7) {
      this.name = name;
      this.version = version;
      this.type = type;
      this.id = id;
      this.params = params;
      this.blocks = {};
      this.links = {};
      this.data = {
        nodes: [],
        edges: []
      };
    } else {
      throw new Error("invalid schema type");
    }
  }

  getBlocksUsingCurrentBlockData(id) {
    let allFieldLinks = this.data.nodes.reduce(
      (v, { field_links }) => (field_links ? v.concat(field_links) : v),
      []
    );
    let blocksIdToChange = [
      ...new Set(
        allFieldLinks
          .filter(v => v.from_block_id === id)
          .map(v => v.to_block_id)
      )
    ];
    return this.data.nodes.filter(b => blocksIdToChange.includes(b.id));
  }

  resetBlockData(id) {
    // reset block data, which used data from block we modified/deleted
    let blocks = this.getBlocksUsingCurrentBlockData(id);
    if (blocks.length) {
      for (const block of blocks) {
        if (
          block.type === BlockType.CONDITION ||
          block.type === BlockType.CHANGE_VARIABLE
        ) {
          block.field_links = undefined;
          block.fields = null;
          block.first = undefined;
          block.second = undefined;
        } else {
          block.field_links = block.field_links.filter(
            v => v.from_block_id !== id
          );
          block.fields = block.fields.filter(v =>
            block.field_links.map(f => f.to_field_id).includes(v.id)
          );
        }
      }
    }
  }

  addBlock(block = new Block("new block", BlockType.ACTION), currentLink) {
    if (!this.blocks.hasOwnProperty(block.id)) {
      Vue.set(this.blocks, block.id, block);
      this.data.nodes.push(block);
      this.saveLocally();
    }
  }

  removeBlock(id) {
    if (this.blocks.hasOwnProperty(id)) {
      Vue.delete(this.blocks, id); // Use for reactivity of blocks
      //delete this.blocks[id];
      this.data.nodes.splice(
        this.data.nodes.findIndex(node => node.id === id),
        1
      );
      this.resetBlockData(id);
      this.saveLocally();
    }
  }

  addLink(link, isRenderNeeded) {
    this.links[link.id] = link;
    this.data.edges.push(link);
    if (isRenderNeeded) {
      this.refreshScheme();
    }
    this.saveLocally();
  }

  removeLink(id, isRenderNeeded) {
    if (this.links.hasOwnProperty(id)) {
      this.data.edges.splice(
        this.data.edges.findIndex(edge => edge.id === id),
        1
      );
      delete this.links[id];
      if (isRenderNeeded) {
        this.refreshScheme();
      }
      this.saveLocally();
    }
  }

  refreshScheme() {
    const start = this.data.nodes.find(v => v.type === BlockType.START);
    const render = new Render(this.data.nodes, this.data.edges);
    render.calculateBaseLineBlocksCoordinate(start);
    render.reOrderBlocksInData();
    render.alignCenterScheme();
    render.renderLinks();
  }

  generateBlockName(type) {
    const blocksNamesLastNumbers = this.data.nodes
      .filter(v => v.type === type)
      .map(v => Number(v.name.split("_").shift()))
      .filter(v => !isNaN(v));
    let maxLastNumber = 1;
    if (blocksNamesLastNumbers.length) {
      maxLastNumber = Math.max(...blocksNamesLastNumbers) + 1;
    }
    switch (type) {
      case BlockType.CREATE_VARIABLE:
        return maxLastNumber + '_Create Variable Block';
      case BlockType.CHANGE_VARIABLE:
        return maxLastNumber + '_Change Variable Block';
      case BlockType.CONDITION:
        return maxLastNumber + '_Condition Block';
      case BlockType.CYCLE:
        return maxLastNumber + '_Loop Block';
      case BlockType.BP:
        return maxLastNumber + '_Business Process Block';
      default:
        return maxLastNumber;
    }
  }

  hideCycleBlocks(blockId) {
    const links = this.data.edges;
    let loopStartCount = 0;
    let loopEndCount = 1;
    for (let j = 0; j < links.length; j++) {
      if (blockId === links[j].to.id) {
        if (links[j].from.type !== BlockType.CYCLE) {
          if (links[j].from.type === BlockType.CYCLE_END) {
            loopEndCount++;
          }
          blockId = links[j].from.id;
          j = -1;
        } else {
          loopStartCount++;
          if (loopEndCount > loopStartCount) {
            blockId = links[j].from.id;
            j = -1;
          } else {
            return links[j].from.id;
          }
        }
      }
    }
  }

  getBlocks(blockId, blockType) {
    let blocks = [];
    let toBlockId = blockId;
    const links = Object.values(this.links);
    let i = 0;
    if (toBlockId) {
      for (i; i < links.length; i++) {
        if (toBlockId === links[i].to.id) {
          if (links[i].from.fields) {
            let fields;
            fields = links[i].from.fields.filter(v => v.type === 2);
            fields = this.expandModelFields(fields, links[i].from.id);
            if (blockType === BlockType.CYCLE) {
              fields = fields.filter(v => v.value_type === 6);
            }
            blocks.push({ ...links[i].from, fields: fields });
            toBlockId = links[i].from.id;
            i = -1;
          } else {
            if (links[i].from.type === BlockType.CYCLE_END) {
              toBlockId = this.hideCycleBlocks(links[i].from.id);
              i = -1;
            } else {
              toBlockId = links[i].from.id;
              i = -1;
            }
          }
        }
      }
    }
    return blocks;
  }

  expandModelFields(fields, blockId) {
    // Use this function instead of getModelFields in future.
    let newFields = [...fields];
    for (const field of fields) {
      if (field.value_type === fieldTypeModel) {
        const model = store.getters.getModels.find(
          v => v.id === field.model_id
        );
        for (const modelField of model.fields) {
          newFields.push(
            new Fields(
              modelField.id,
              modelField.type,
              2,
              field.name + "." + modelField.name,
              blockId,
              modelField.array_field_type,
              modelField.value,
              modelField.model_id
                ? modelField.model_id
                : modelField.array_model_id
                ? modelField.array_model_id
                : modelField.relation_model_id,
              field.id,
              modelField.enum_id
            )
          );
        }
      }
    }
    return newFields;
  }

  // getModelFields() {
  //   if (this.blocks) {
  //     for (const block in this.blocks) {
  //       if (
  //         this.blocks[block].type === BlockType.BP &&
  //         this.blocks[block].fields
  //       ) {
  //         const fields = [...this.blocks[block].fields];
  //         for (const field of fields) {
  //           if (field.value_type === 5) {
  //             const model = store.getters.getModels.find(
  //               v => v.id === field.model_id
  //             );
  //             for (const modelField of model.fields) {
  //               this.blocks[block].fields.push(
  //                 new Fields(
  //                   modelField.id,
  //                   modelField.type,
  //                   2,
  //                   field.name + "." + modelField.name,
  //                   this.blocks[block].id,
  //                   modelField.array_field_type,
  //                   undefined,
  //                   modelField.model_id ? modelField.model_id : modelField.array_model_id,
  //                   field.id,
  //                   modelField.enum_id
  //                 )
  //               );
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  importFromJson(json, deleteAfter = true) {
    store.commit("setImportingStatus", true);
    this.reset(json.name, json.version, json.id, json.type, json.params);
    store.commit("setLoading", true);
    if (json.hasOwnProperty("blocks")) {
      for (let i = 0; i < json.blocks.length; ++i) {
        const block = new Block(
          json.blocks[i].id ? json.blocks[i].id : uuidv4(),
          json.blocks[i].name,
          json.blocks[i].type,
          json.blocks[i].fields,
          json.blocks[i].async,
          json.blocks[i].params,
          json.blocks[i].x,
          json.blocks[i].y,
          json.blocks[i].process,
          json.blocks[i].run_bp
            ? json.blocks[i]["run_bp"].bp_id
            : json.blocks[i].bp_id,
          json.blocks[i].condition_type
            ? json.blocks[i].condition_type
            : json.blocks[i].condition
            ? json.blocks[i].condition.type
            : null,
          json.blocks[i].first
            ? json.blocks[i].first
            : json.blocks[i].variable_change
            ? json.blocks[i].variable_change.first
            : json.blocks[i].condition
            ? json.blocks[i].condition.first
            : null,
          json.blocks[i].second
            ? json.blocks[i].second
            : json.blocks[i].variable_change
            ? json.blocks[i].variable_change.second
            : json.blocks[i].condition
            ? json.blocks[i].condition.second
            : null,
          json.blocks[i].change_type
            ? json.blocks[i].change_type
            : json.blocks[i].variable_change
            ? json.blocks[i].variable_change.type
            : null
        );
        this.addBlock(block);
      }
      if (
        !Object.values(this.blocks).filter(
          v => v.type === BlockType.START || v.type === BlockType.END
        ).length
      ) {
        const startBlockId = uuidv4();
        const endBlockId = uuidv4();
        const startParams = json.fields.length
          ? json.fields.filter(v => v.type === 1).map(v => ( {...v, block_id: startBlockId} ))
          : null;
        const endParams = json.fields.length
          ? json.fields.filter(v => v.type === 2).map(v => ( {...v, block_id: endBlockId} ))
          : null;
        const start = new Block(
          startBlockId,
          "start",
          BlockType.START,
          startParams
        );
        const end = new Block(
          endBlockId,
          "end",
          BlockType.END,
          endParams
        );
        this.addBlock(start);
        this.addBlock(end);
      }
    }
    if (json.hasOwnProperty("links")) {
      for (let i = 0; i < json.links.length; ++i) {
        const from = this.blocks[json.links[i].from_block_id]
          ? this.blocks[json.links[i].from_block_id]
          : json.links[i].from_block
          ? this.blocks[json.links[i].from_block]
          : this.blocks[
              Object.keys(this.blocks).find(
                k => this.blocks[k]["type"] === BlockType.START
              )
            ];
        const to = this.blocks[json.links[i].to_block_id]
          ? this.blocks[json.links[i].to_block_id]
          : json.links[i].to_block
          ? this.blocks[json.links[i].to_block]
          : this.blocks[
              Object.keys(this.blocks).find(
                k => this.blocks[k]["type"] === BlockType.END
              )
            ];
        if (from && to) {
          this.addLink(
            new Link(
              from,
              to,
              json.links[i].x,
              json.links[i].y,
              json.links[i].value && JSON.parse(json.links[i].value),
              json.links[i].default_order !== undefined
                ? JSON.parse(json.links[i].default_order)
                : undefined
            ),
            i === json.links.length - 1 && true
          );
        }
      }
    }
    if (json.hasOwnProperty("field_links")) {
      for (let i = 0; i < json.field_links.length; ++i) {
        let block = json.blocks.find(
          b => json.field_links[i].to_block_id === b.id
        );
        if (!json.field_links[i].to_block_id) {
          block = Object.values(this.blocks).find(
            b => b.type === BlockType.END
          );
          json.field_links[i].to_block_id = block.id;
        }
        if (!json.field_links[i].from_block_id) {
          const startBlock = Object.values(this.blocks).find(
            b => b.type === BlockType.START
          );
          json.field_links[i].from_block_id = startBlock.id;
        }
        if (block) {
          this.blocks[block.id]["field_links"] =
            this.blocks[block.id]["field_links"] || [];
          this.blocks[block.id]["field_links"].push(json.field_links[i]);
        }
      }
    }
    if (deleteAfter) {
      this.removeSave();
    }
    store.commit("setLoading", false);
    store.commit("setImportingStatus", false);
  }

  exportAsJson() {
    const schema = cloneDeep(this);
    delete schema.params;
    delete schema.dimensions;
    delete schema.graph;
    delete schema.data;
    delete schema.length;
    const blocks = [];
    const links = [];
    const field_links = [];
    let fields = [];
    for (const block in schema.blocks) {
      if (schema.blocks[block].field_links) {
        for (const fieldLink of schema.blocks[block].field_links) {
          if (
            schema.blocks[fieldLink.from_block_id].type === BlockType.START
          ) {
            fieldLink.from_block_id = ""; // Remove from_block_id and to_block_id from field_links if it points to Start or End blocks.
          }
          if (schema.blocks[fieldLink.to_block_id].type === BlockType.END) {
            fieldLink.to_block_id = "";
          }
          field_links.push(fieldLink);
        }
      }
      if (schema.blocks.hasOwnProperty(block)) {
        if (
          schema.blocks[block].type === BlockType.START ||
          schema.blocks[block].type === BlockType.END
        ) {
          if (schema.blocks[block].fields) {
            for (const field of schema.blocks[block].fields) {
              if (schema.blocks[block].type === BlockType.START) {
                fields.push({ ...field, type: 1, block_id: "" });
              } else {
                fields.push(field);
              }
            }
            // delete schema.blocks[block];
          }
        } else {
          blocks.push(schema.blocks[block]);
        }
      }
    }
    for (const link in schema.links) {
      if (schema.links.hasOwnProperty(link)) {
        if (schema.links[link].from.type === BlockType.START) {
          delete schema.links[link].from;
        }
        if (schema.links[link].to.type === BlockType.END) {
          delete schema.links[link].to;
        }
        schema.links[link].from_block = schema.links[link].from
          ? schema.links[link].from.id
          : null;
        schema.links[link].to_block = schema.links[link].to
          ? schema.links[link].to.id
          : null;
        if (!schema.links[link].from_block) {
          delete schema.links[link].from_block;
        }
        if (!schema.links[link].to_block) {
          delete schema.links[link].to_block;
        }
        if (schema.links[link].value !== undefined) {
          schema.links[link].value = schema.links[link].value.toString();
        }
        if (schema.links[link].default_order !== undefined) {
          schema.links[link].default_order = schema.links[link].default_order.toString();
        }
        delete schema.links[link].from;
        delete schema.links[link].to;
        links.push(schema.links[link]);
      }
    }
    schema.blocks = blocks;
    schema.links = links;
    schema.field_links = field_links;
    schema.fields = fields;
    return schema;
  }

  saveLocally() {
    if (!store.getters.getImportingStatus) {
      localForage.setItem(
        `appmaster-bp-(${this.id})`,
        JSON.stringify(this.exportAsJson())
      );
    }
  }

  removeSave() {
    localForage.removeItem(`appmaster-bp-(${this.id})`);
  }
}
