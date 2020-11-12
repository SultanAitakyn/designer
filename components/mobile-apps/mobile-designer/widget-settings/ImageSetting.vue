<template>
  <span>
    <a-upload
      name="image"
      list-type="picture-card"
      class="image-uploader"
      :show-upload-list="false"
      :customRequest="handleUpload"
      :before-upload="beforeUpload"
      style="position: relative;"
    >
      <img
        v-if="fileId"
        :src="`/api/bff//files/${fileId}/download/`"
        style="max-width: 100%; height: auto;"
        alt=""
      />
      <div v-else>
        <a-icon :type="loading ? 'loading' : 'plus'"/>
        <div class="ant-upload-text">Upload</div>
      </div>
    </a-upload>
    <a v-if="fileId && !disableClear" href="#" style="color: red;" @click.prevent="$emit('change', '')">
      <a-icon type="delete"/>
      clear
    </a>
  </span>
</template>

<script>
  import {uploadFiles} from "@/requests/MobileApps";


  export default {
    name: "ImageSetting",
    model: {
      prop: 'fileId',
      event: 'change'
    },
    props: {
      fileId: {
        type: String,
        default: ''
      },
      disableClear: Boolean
    },
    data() {
      return {
        loading: false,
      }
    },
    methods: {
      beforeUpload(file) {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
        if (!isJpgOrPng) {
          this.$message.error('You can only upload a jpg, png or gif file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          this.$message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
      },

      handleUpload({file}) {
        this.loading = true;
        uploadFiles(file.name, file)
          .then(res => {
            if (res.status === "success") {
              this.$emit('change', res.id)
            }
            this.loading = false;
          })
          .catch(e => {
            this.loading = false;
            this.$message.error('Upload error')
          })
      },
    }
  }
</script>
