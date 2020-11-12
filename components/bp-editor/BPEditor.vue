<template>
  <div>
    <div class="bp-editor">
      <div class="item-panel">
        <!--    Item panel-->
        <h2 class="item-panel-title">Blocks Panel</h2>
        <draggable
          :list="blocksFromPanel"
          :group="{ name: 'any', pull: 'clone', put: false }"
          :revertOnSpill="true"
          :clone="cloneBlock"
          @end="onBlockAdd"
          :sort="false"
          class="item-panel-blocks-wrapper"
        >
          <component
            :isFromPanel="true"
            class="item-panel-block"
            :is="block.blockType"
            :block="block"
            v-for="block in blocksFromPanel"
            :key="block.id"
          />
        </draggable>
        <div class="item-panel-blocks-wrapper labels">
          <div
            class="item-panel-block-label"
            :key="block.id"
            v-for="block in blocksFromPanel"
          >
            {{ block.label }}
          </div>
        </div>
      </div>
      <div class="bp-editor area">
        <div class="bp-editor canvas">
          <component
            :is="block.blockType"
            :block="block"
            :links="links"
            v-for="block in blocks"
            :key="block.id"
            @onEditBlock="onEditBlock"
          />
          <Lines
            v-for="link in links"
            :key="link.id"
            :link="link"
            :enums="enums"
          />
          <a-spin v-if="isSchemeLoading" class="scheme-loader"/>
        </div>
      </div>
    </div>
    <a-modal
      title="Create new block"
      v-model="isNewBlockFormOpen"
      :destroyOnClose="true"
    >
      <template slot="footer">
        <a-row type="flex" justify="space-between">
          <a-col>
            <a-tooltip placement="bottom">
              <template slot="title">
                Delete this block
              </template>
              <a-button
                v-if="
                  currentBlock &&
                    currentBlock.type !== types.START &&
                    currentBlock.type !== types.END
                "
                key="delete"
                type="danger"
                htmlType="reset"
                ghost
                @click="onModalDeleteBlock"
                ><a-icon type="delete"
              /></a-button>
            </a-tooltip>
          </a-col>
          <a-col>
            <a-button key="back" @click="close">{{ currentBlock &&
              (currentBlock.type === types.START ||
              currentBlock.type === types.END) ? 'Close' : 'Cancel' }}</a-button>
            <a-button
              v-if="
                currentBlock &&
                  currentBlock.type !== types.START &&
                  currentBlock.type !== types.END
              "
              form="blockForm"
              key="submit"
              htmlType="submit"
              type="primary"
              >Save</a-button
            >
          </a-col>
        </a-row>
      </template>
      <BlockFormsManager
        ref="addBlock"
        @close="close"
        @onBlockFormSubmit="update"
        @delete="v => deleteBlock(v)"
        :block="currentBlock"
        :models="models"
        :enums="enums"
        :businessProcesses="businessProcesses"
        :groupedBusinessP="groupedBusinessP"
      />
    </a-modal>
    <modal-first-help :isOpen.sync="isShowFirstHelp">
      <div
        title="How to create a business process"
        data-description="A business process is a small piece of your app's logic. Business processes designed to work with data: search, get, update,
        delete, mutate and make all actions inside of the backend part of your project. All basic business processes for every data model are created
        automatically and called the system. System BPs can't be edited or deleted, also they not visible in the common list inside of BP Designer.
        But you can use system BPs in endpoints and call them from your business process."
        data-link="https://docs.appmaster.io/docs/working-with-business-processes"
        :style="{ backgroundImage: `url(${require('@/assets/img/help/createBusinessProcess.gif')})` }"
      />
    </modal-first-help>
  </div>
</template>

<script>
import uuidv4 from "uuid/v4";
import localForage from "localforage";
import { Modal } from "ant-design-vue";
import CanvasMenu from "@/components/shared/canvas/CanvasMenu";
import LinkForm from "@/components/bp-editor/link/LinkForm";
import { Schema, SchemaType } from "@/components/bp-editor/schema/Schema";
import { Block, BlockType } from "@/components/bp-editor/block/Block";
import { Link } from "@/components/bp-editor/link/Link";
import { getBP } from "@/requests/BPs";
import { getBusinessProcesses, getModels, getEnums } from "@/requests/Apps";
import start from "@/components/bp-editor/block/blocks/Start";
import end from "@/components/bp-editor/block/blocks/End";
import BP from "@/components/bp-editor/block/blocks/BusinessProc";
import CONDITION from "@/components/bp-editor/block/blocks/Condition";
import CREATE_VARIABLE from "@/components/bp-editor/block/blocks/CreateVariable";
import CHANGE_VARIABLE from "@/components/bp-editor/block/blocks/ChangeVariable";
import CYCLE from "@/components/bp-editor/block/blocks/Loop";
import CYCLE_END from "@/components/bp-editor/block/blocks/LoopEnd";
import Lines from "@/components/bp-editor/block/blocks/Line";
import { ElementsDrawParams } from "@/components/bp-editor/block/blocks/ElementsParams";
import draggable from "vuedraggable";
import { getFieldValueTypes } from "@/requests/Apps";
import { Render } from "./schema/Render";
import BlockFormsManager from "./block/BlockFormsManager";
import { getGroupedBPs } from "@/requests/BPs";
import ModalFirstHelp from '@/views/main/modals/ModalFirstHelp';

export default {
  name: "BPEditor",
  components: {
    BlockFormsManager,
    LinkForm,
    CanvasMenu,
    start,
    end,
    BP,
    CONDITION,
    CREATE_VARIABLE,
    CHANGE_VARIABLE,
    CYCLE,
    CYCLE_END,
    draggable,
    Lines,
    ModalFirstHelp,
  },
  props: {
    appId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      blocksFromPanel: [
        {
          label: "Business Process",
          type: BlockType.BP,
          blockType: "BP"
        },
        {
          label: "Create variable",
          type: BlockType.CREATE_VARIABLE,
          blockType: "CREATE_VARIABLE"
        },
        {
          label: "Change variable",
          type: BlockType.CHANGE_VARIABLE,
          blockType: "CHANGE_VARIABLE"
        },
        {
          label: "Condition",
          type: BlockType.CONDITION,
          blockType: "CONDITION"
        },
        {
          label: "Loop",
          type: BlockType.CYCLE,
          blockType: "CYCLE"
        }
      ],
      isNewBlockFormOpen: false,
      currentBlock: null,
      groupedBusinessP: [],
      types: BlockType,
      druggedBlock: null,
      enums: null,
      businessProcesses: [],
      isShowFirstHelp: !this.$store.getters['tracking/isPageVisited'](this.$route.path),
      isSchemeLoading: false
    };
  },
  computed: {
    blocks() {
      return this.schema ? this.schema.data.nodes : null;
    },
    links() {
      return this.schema ? this.schema.data.edges : null;
    },
    schema: {
      get() {
        return this.$store.getters.getSchema;
      },
      set(newSchema) {
        this.$store.commit("setSchema", newSchema);
      }
    },
    models: {
      get() {
        return this.$store.getters.getModels;
      },
      set(newModels) {
        this.$store.commit("setModels", newModels);
      }
    },
    currentEntity: {
      get() {
        return this.$store.getters.getCurrentEntity;
      },
      set(newCurrentEntity) {
        this.$store.commit("setCurrentEntity", newCurrentEntity);
      }
    },
    fieldValueTypes: {
      get() {
        return this.$store.state.fieldValueTypes;
      },
      set(newTypes) {
        this.$store.commit("setFieldValueTypes", newTypes);
      }
    },
  },
  methods: {
    onEditBlock(value) {
      this.currentBlock = value;
      this.isNewBlockFormOpen = true;
    },
    cloneBlock(value) {
      this.druggedBlock = value;
      return value;
    },
    promptLocalLoad(data) {
      localForage
        .getItem(`appmaster-bp-(${this.schema.id})`)
        .then(localSchema => {
          if (localSchema) {
            const modal = Modal.confirm({
              title: "Save found",
              content:
                "You have edits to this business process saved locally. Do you want to load them?",
              onOk: () => {
                modal.destroy();
                this.schema.importFromJson(JSON.parse(localSchema), false);
              },
              onCancel: () => {
                modal.destroy();
                if (data) {
                  this.schema.importFromJson(data);
                } else {
                  this.schema.removeSave();
                }
              }
            });
          } else if (data) {
            this.schema.importFromJson(data);
          }
        });
    },
    close() {
      this.currentEntity = null;
      this.isNewBlockFormOpen = false;
    },
    onModalDeleteBlock() {
      this.$refs.addBlock.onBlockDelete();
    },
    update(data) {
      this.currentBlock.changeValues(data);
      if (data.cases && data.cases.length) {
        const render = new Render(this.blocks, this.links);
        let conditionEnd;
        if (
          this.currentBlock.type === BlockType.CONDITION &&
          !this.currentBlock.second
        ) {
          conditionEnd = render.findConditionEnd(this.currentBlock);
          let branchesToRemove = this.links.filter(
            v =>
              v.from.id === this.currentBlock.id &&
              !data.cases.map(v => v.case).includes(v.value)
          );
          for (let branch of branchesToRemove) {
            this.deleteConditionBranch(branch, branch.to, conditionEnd);
          }
        } else {
          conditionEnd = render.findConditionEnd(this.currentBlock, null);
        }
        for (let i = 0; i < data.cases.length; i++) {
          if (
            !this.links
              .filter(v => v.from.id === this.currentBlock.id)
              .map(v => v.value)
              .includes(data.cases[i].case)
          ) {
            this.createLink(
              {
                start: this.currentBlock,
                end: conditionEnd,
                x: 0,
                y: 0,
                value: data.cases[i].case,
                default_order: data.cases[i].key.toString()
              },
              false
            );
          }
        }
        this.schema.refreshScheme();
        delete data.cases;
      }
      this.schema.saveLocally();
      this.close();
    },
    getAroundBlocks(x, y) {
      const currentLink = this.links.find(
        v => v.x > x - 5 && v.x < x + 5 && v.y > y - 5 && v.y < y + 5
      ); // Link in which we dragged block. При ручном зуме страницы браузера, иногда происходит смещение драг зоны на 1 или 2 пикселя. Из - за этого по смещенным координатам невозможно найти нужную связь.
      // поэтому добавил погрешность в 5 пикселей при поиске. Это временное решение данной проблемы.
      return currentLink ? {
        from: currentLink.from,
        to: currentLink.to,
        currentLink
      } : null;
    },
    onBlockAdd(value) {
      const aroundBlocks = this.getAroundBlocks(
        value.to.offsetLeft,
        value.to.offsetTop,
        this.druggedBlock.type
      );
      if (aroundBlocks) {
        let y;
        if (this.druggedBlock.type === BlockType.CYCLE) {
          y =
            value.to.offsetTop +
            ElementsDrawParams.lineHeight / 2 -
            ElementsDrawParams.loopBlockHeight / 2;
        } else {
          y = value.to.offsetTop;
        }
        const x = value.to.offsetLeft + ElementsDrawParams.lineWidth;
        if (this.druggedBlock) {
          this.createBlock({
            id: uuidv4(),
            name: this.schema.generateBlockName(this.druggedBlock.type),
            type: this.druggedBlock.type,
            from_block: aroundBlocks.from,
            to_block: aroundBlocks.to,
            x: x,
            y: y,
            currentLink: aroundBlocks.currentLink
          });
          this.isNewBlockFormOpen = true;
        }
      }
    },
    createBlock(data) {
      const block = new Block(
        uuidv4(),
        data.name,
        data.type,
        data.fields,
        data.async,
        data.params,
        0, //  data.x,
        0, //  data.y,
        data.process,
        data.bp_id,
        data.condition_type,
        data.first,
        data.second,
        data.change_type,
        data.field_links
      );
      this.schema.addBlock(block);
      if (block.type !== BlockType.CYCLE_END) {
        this.currentBlock = block;
        this.schema.removeLink(data.currentLink.id);
      }
      if (block.type === BlockType.CYCLE) {
        const endBlock = new Block(
          uuidv4(),
          "cycle_end",
          BlockType.CYCLE_END,
          null,
          false,
          null,
          0,
          0,
          null,
          data.bp_id,
          data.condition_type,
          data.first,
          data.second,
          data.change_type,
          data.field_links
        );
        this.schema.addBlock(endBlock);
        this.createLink(
          {
            start: data.from_block,
            end: block,
            value: data.currentLink.value
              ? data.currentLink.value
              : data.from_block.type === BlockType.CONDITION
              ? false
              : undefined,
            default_order:
              data.currentLink.default_order !== undefined
                ? data.currentLink.default_order
                : undefined
          },
          false
        );
        this.createLink(
          {
            start: block,
            end: endBlock
          },
          false
        );
        this.createLink(
          {
            start: endBlock,
            end: data.to_block
          },
          true
        );
        this.schema.removeLink(data.currentLink.id);
      } else {
        this.createLink(
          {
            start: data.from_block,
            end: block,
            value: data.currentLink.value
              ? data.currentLink.value
              : data.from_block.type === BlockType.CONDITION
              ? false
              : undefined,
            default_order:
              data.currentLink.default_order !== undefined
                ? data.currentLink.default_order
                : undefined
          },
          false
        );
        this.createLink(
          {
            start: block,
            end: data.to_block,
            value: block.type === BlockType.CONDITION ? false : undefined
          },
          block.type !== BlockType.CONDITION
        );
      }
      if (block.type === BlockType.CONDITION) {
        this.createLink(
          {
            start: block,
            end: data.to_block,
            value: true
          },
          true
        );
      }
    },
    createLink(data, isRenderNeeded) {
      const link = new Link(
        data.start,
        data.end,
        0,
        0,
        data.value,
        data.default_order
      );
      this.schema.addLink(link, isRenderNeeded);
    },
    changeLinksToBlockValue(block, toBlock) {
      let linksConnectedToDeletedBlock = this.links.filter(
        v => v.to.id === block.id
      );
      linksConnectedToDeletedBlock.forEach(
        (item, index, array) => (array[index].to = toBlock)
      );
    },
    deleteBlock(block) {
      let currentBlockSecondLink = this.schema.data.edges.find(
        v => v.from.id === block.id
      );
      if (block.type === BlockType.CONDITION) {
        let render = new Render(this.blocks, this.links);
        let conditionEnd = render.findConditionEnd(block);
        this.schema.removeBlock(block.id);
        this.getBranchesToDelete(block, conditionEnd);
        this.changeLinksToBlockValue(block, conditionEnd);
        this.schema.refreshScheme();
      } else if (block.type === BlockType.CYCLE) {
        let render = new Render(this.blocks, this.links);
        let loopEnd = render.findLoopEnd(block, 0, 0);
        let afterLoopEndBlock = this.deleteLoopWithInsideBlocks(block, loopEnd);
        this.changeLinksToBlockValue(block, afterLoopEndBlock);
        this.schema.refreshScheme();
      } else {
        this.schema.removeBlock(block.id);
        this.changeLinksToBlockValue(block, currentBlockSecondLink.to);
        this.schema.removeLink(currentBlockSecondLink.id, true);
      }
      this.close();
    },
    getBranchesToDelete(block, conditionEnd) {
      let branchesToDelete = this.schema.data.edges.filter(
        v => v.from.id === block.id
      );
      for (let branch of branchesToDelete) {
        this.deleteConditionBranch(branch, branch.to, conditionEnd);
      }
    },
    deleteBlocks(block, i, linksToRemove) {
      if (block.type === BlockType.CONDITION) {
        let render = new Render(this.blocks, this.links);
        let currentConditionEnd = render.findConditionEnd(block);
        this.getBranchesToDelete(block, currentConditionEnd);
        this.schema.removeBlock(block.id);
        block = currentConditionEnd;
      } else {
        this.schema.removeBlock(block.id);
        linksToRemove.push(this.links[i]);
        block = this.links[i].to;
      }
      return { block, linksToRemove };
    },
    deleteConditionBranch(branchFirstLink, block, conditionEnd) {
      let linksToRemove = [branchFirstLink];
      for (let i = 0; i < this.links.length; i++) {
        if (block.id !== conditionEnd.id) {
          if (block.id === this.links[i].from.id) {
            const data = this.deleteBlocks(block, i, linksToRemove);
            block = data.block;
            linksToRemove = data.linksToRemove;
            i = -1;
          }
        }
      }
      for (let link of linksToRemove) {
        this.schema.removeLink(link.id, false);
      }
    },
    deleteLoopWithInsideBlocks(block, loopEnd) {
      let linksToRemove = [];
      let blockAfterLoop = null;
      for (let i = 0; i < this.links.length; i++) {
        if (block.id === this.links[i].from.id) {
          if (block.id !== loopEnd.id) {
            const data = this.deleteBlocks(block, i, linksToRemove);
            block = data.block;
            linksToRemove = data.linksToRemove;
            i = -1;
          } else {
            this.schema.removeBlock(block.id);
            blockAfterLoop = this.links[i].to;
            linksToRemove.push(this.links[i]);
            i = this.links.length;
          }
        }
      }
      for (let link of linksToRemove) {
        this.schema.removeLink(link.id, false);
      }
      return blockAfterLoop;
    },
    generateBpSchemeName() {
      const bpNamesLastNumbers = this.businessProcesses
        .map(v => Number(v.name.split("#").pop()))
        .filter(v => !isNaN(v));
      let maxLastNumber = 1;
      if (bpNamesLastNumbers.length) {
        maxLastNumber = Math.max(...bpNamesLastNumbers) + 1;
      }
      return "Business Process#" + maxLastNumber;
    },
    showFirstHelp() {
      this.isShowFirstHelp = true;
    },
    createBasicScheme() {
      this.schema = new Schema(
        this.generateBpSchemeName(),
        1,
        -1,
        SchemaType.CREATE
      );
    }
  },
  async mounted() {
    let schemaId = this.$route.params.id
      ? this.$route.params.id
      : null;
    this.isSchemeLoading = true;
    let response = await getBusinessProcesses(this.appId, true, -1, 0);
    this.businessProcesses = response.data.filter(
      v => v.id !== schemaId
    );
    if (schemaId) {
      getBP(schemaId, true).then(response => {
        this.isSchemeLoading = false;
        this.createBasicScheme();
        this.promptLocalLoad(response);
      });
    } else {
      this.isSchemeLoading = false;
      this.createBasicScheme();
      this.promptLocalLoad();
    }
  },
  created() {
    this.$root.$on('showFirstHelp', this.showFirstHelp);
  },
  beforeMount() {
    this.schema = null;
    getModels(this.appId, -1).then(response => {
      this.models = response.data;
    });
    getEnums(this.appId).then(response => {
      this.enums = response.data;
    });
    getFieldValueTypes(this.appId).then(response => {
      this.fieldValueTypes = response;
    });
    getGroupedBPs(this.appId).then(response => {
      this.groupedBusinessP = response.data;
    });
  },
  beforeDestroy() {
    this.close();
    this.$root.$off('showFirstHelp', this.showFirstHelp);
  }
};
</script>

<style scoped>
.bp-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 600px;
  height: 100%;
}

.item-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 15px;
  min-width: 150px;
  border: 1px solid #d6d0d0;
  border-radius: 0 10px 0 0;
  /*rgba(176, 176, 176, 0.54);*/
}

.item-panel-title {
  font-size: 1rem;
  text-align: center;
  margin-bottom: 10px;
  padding: 0;
}

.item-panel-blocks-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  margin-top: 5px;
}

.item-panel-block {
  margin: 0 30px;
}

.item-panel-block-label {
  width: 105px;
  margin: 0 15px 5px;
  text-align: center;
}

.bp-editor .area {
  background: #fafafa;
  width: 100%;
  height: 100%;
  padding: 0 15px;
  margin-top: 15px;
  overflow: auto;
}

.bp-editor .canvas {
  position: relative;
}

.scheme-loader{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
