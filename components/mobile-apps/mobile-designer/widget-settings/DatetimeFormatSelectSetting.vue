<template>
  <a-select :value="format" :size="size" @change="$emit('change', $event)">
    <a-select-option v-for="datetimeFormat of datetimeFormats" :key="datetimeFormat.value" :value="datetimeFormat.value">
      {{moment(datetime || undefined).format(datetimeFormat.momentFormat)}}
    </a-select-option>
  </a-select>
</template>

<script>
  import {datetimeFormats} from "@/utils/mautils";
  import moment from "moment";


  export default {
    name: "DatetimeFormatSelectSetting",
    model: {
      prop: 'format',
      event: 'change'
    },
    props: {
      format: String,
      datetime: String,
      size: String
    },
    data() {
      return {
        moment,
        datetimeFormats
      }
    },
  }
</script>
