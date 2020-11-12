<template>
  <a-select
    :value="fileTypes"
    mode="multiple"
    allowClear
    :size="size"
    @change="$emit('change', $event)"
  >
    <a-select-option value="images">images</a-select-option>
    <a-select-option value="documents">documents</a-select-option>
    <a-select-option value="videos">videos</a-select-option>
  </a-select>
</template>

<script>
  export default {
    name: "FileTypesSetting",
    model: {
      prop: 'fileTypes',
      event: 'change'
    },
    props: {
      fileTypes: Array,
      size: String
    },
  }
</script>
