<template>
  <a-date-picker
    v-if="datetimeFormat.type !== 'time'"
    :value="datetime"
    :format="datetimeFormat.momentFormat"
    :show-time="datetimeFormat.type === 'datetime'"
    :secondStep="secondStep"
    value-format="YYYY-MM-DDTHH:mm:ssZ"
    :size="size"
    @change="emitChange"
  />
  <a-time-picker
    v-else
    :value="datetime"
    :format="datetimeFormat.momentFormat"
    :use12-hours="datetimeFormat.value === 'h:mm a'"
    :secondStep="secondStep"
    value-format="YYYY-MM-DDTHH:mm:ssZ"
    :size="size"
    @change="emitChange"
  />
</template>

<script>
  import {datetimeFormats} from "@/utils/mautils";


  export default {
    name: "DatetimePicker",
    model: {
      prop: 'datetime',
      event: 'change'
    },
    props: {
      datetime: String,
      format: String,
      secondStep: Number,
      size: String
    },
    computed: {
      datetimeFormat() {
        return datetimeFormats.find(dtf => dtf.value === this.format)
      }
    },
    methods: {
      emitChange(e) {
        this.$emit('change', e)
      }
    }
  }
</script>
