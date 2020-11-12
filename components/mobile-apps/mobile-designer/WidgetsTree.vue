<template>
  <a-card size="small" style="overflow-y: auto">
    <a-tree
      show-line
      default-expand-all
      :tree-data="treeData"
      @select="handleSelect($event[0])"
    >
      <a-icon slot="switcherIcon" type="down" />
    </a-tree>
  </a-card>
</template>

<script>
  import {mapMutations, mapState} from "vuex";


  export default {
    name: "WidgetsTree",

    computed: {
      ...mapState('mobileDesigner', ['screens', 'screensReady', 'selectedScreenIndex']),

      treeData() {
        const deepMap = children => {
          if (children && children.length) {
            return children.map(c =>({key: c.model.key, title: c.model.name, children: deepMap(c.model.children)}))
          }
        }
        if (this.screensReady) {
          return this.screens[this.selectedScreenIndex].model.model.children.map(w => {
            return {
              title: w.model.name,
              key: w.model.key,
              children: deepMap(w.model.children)
            }
          })
        } else {
          return []
        }
      }
    },

    methods: {
      ...mapMutations('mobileDesigner', ['setSelectedElem']),

      handleSelect(e) {
        function findNode(key, currentNode) {
          let i, currentChild, result;
          if (key === currentNode.model.key) {
            return currentNode;
          } else {
            if (currentNode.model.children) {
              for (i = 0; i < currentNode.model.children.length; i += 1) {
                currentChild = currentNode.model.children[i];
                result = findNode(key, currentChild);
                if (result !== false) {
                  return result;
                }
              }
            }
            return false;
          }
        }
        const foundedNode = findNode(e, this.screens[this.selectedScreenIndex].model)
        if (foundedNode) {
          this.setSelectedElem(foundedNode)
        }
      }
    }
  }
</script>
