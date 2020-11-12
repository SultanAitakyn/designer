<template>
  <div
    v-if="screen"
    ref="modal-screen"
    class="modal-screen"
    style="min-height: 100%;"
  >
    <a-modal
      visible
      width="100%"
      transitionName=""
      maskTransitionName=""
      centered
      :closable="false"
      :title="screen.model.model.navigation.title"
      :get-container="() => $refs['modal-screen']"
      :mask-style="{position: 'absolute'}"
      :dialog-style="{maxWidth: '100%'}"
      :body-style="{padding: 0, background: background || '#fff'}"
    >
      <ma-stack
        :disableDrag="false"
        :isRootStack="true"
        :parentScreenKey="screen.model.model.key"
        :elem="screen.model.model.children[0]"
        :key="screen.model.model.children[0].model.key"
        style="min-height: 64px"
      />
      <template slot="footer">
        <a-button block style="max-width: none" size="large">Close</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
  import BaseScreen from "@/components/mobile-apps/mobile-designer/screens/BaseScreen";
  import maStack from "@/components/mobile-apps/mobile-designer/widgets/ma-stack";


  export default {
    name: "mas-modal",
    mixins: [BaseScreen],
    components: {
      'ma-stack': maStack,
    }
  };
</script>

<style scoped>
  .modal-screen >>> .ant-modal-wrap {
    position: absolute;
    padding: 16px;
  }
  .modal-screen >>> .ant-modal-wrap::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }
  .modal-screen >>> .ant-modal-wrap::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, .25);
  }
  .modal-screen >>> .ant-modal-content {
    background: transparent;
    box-shadow: none;
  }
  .modal-screen >>> .ant-modal-header {
    display: none;
    position: absolute;
    width: 100%;
    padding: 8px 16px;
    border-bottom: none;
    background: none;
  }
  .modal-screen >>> .ant-modal-title {
    line-height: 24px;
  }
  .modal-screen >>> .ant-modal-body {
    background: transparent;
    border-radius: 4px;
    box-shadow: none;
  }
  .modal-screen >>> .ant-modal-footer {
    position: absolute;
    width: 100%;
    padding: 16px 0;
    border-top: none;
  }
</style>
