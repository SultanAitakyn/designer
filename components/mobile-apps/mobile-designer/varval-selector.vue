<template>
  <a-radio-group
    buttonStyle="solid"
    size="small"
    v-model="useVar"
    @change="$emit('change',$event.target.value)">
    <a-radio-button :value="3">Field</a-radio-button>
    <a-radio-button :value="2">Variable</a-radio-button>
    <a-radio-button :value="1">Value</a-radio-button>
  </a-radio-group>
</template>

<script>

  export default {
    name: "varval-selector",
    props: { vselector: Number },
    watch:{
    vselector: function (val){
      this.useVar=val;
      }
    },

    beforeMount() {
      this.useVar=this.vselector;
    },
    methods:{
    },
    data(){
      return{
        useVar: 0,

      }
    }


  }

</script>
