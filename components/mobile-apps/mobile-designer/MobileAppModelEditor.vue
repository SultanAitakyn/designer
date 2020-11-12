<template>
  <a-modal
    v-model="v"
    width="750px"
    title="Edit config"
   >
    <a-alert type="warning" style="margin-bottom: 10px;">
      <template slot="message">
        <b><a-icon type="warning" theme="filled"  style="color: orange"/> Real-time edition mode.</b> Use with extreme caution, don't save config if everything goes wrong.
      </template>
    </a-alert>
    <v-jsoneditor v-model="$store.state.mobileDesigner"
                  :plus="true"
                  height="650px"/>
    <template slot="footer">
      <a-button type="primary" @click="$emit('close')">Close</a-button>
    </template>
  </a-modal>
</template>

<script>
import VJsoneditor from 'v-jsoneditor';

  export default {
    name: "MobileAppModelEditor",
    props: { visible: Boolean },
    components: {
      VJsoneditor,
    },
    computed:{
      v:{
        get(){
          return this.visible;
        },
        set(){
          this.$emit('close');
        }
      }
    },
  }
</script>
