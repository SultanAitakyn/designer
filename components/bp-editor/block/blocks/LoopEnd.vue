<template>
    <div :style="blockCoordinates">
    </div>
</template>

<script>
    export default {
        name: "LoopEnd",
      props: { block: Object, isFromPanel: Boolean },
      computed: {
        blockCoordinates() {
          return this.block
            ? {
              left: this.block.x + "px",
              top: this.block.y + "px",
              position: "absolute",
              height: "140px",
              width: "0px"
            }
            : null;
        }
      }
    }
</script>

<style scoped>

</style>
