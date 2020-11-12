<template>
  <div>
    <a-form-model-item label="Team" prop="ios.credentials.team">
      <a-input v-model="credentials.team"/>
    </a-form-model-item>

    <a-form-model-item label="Login" prop="ios.credentials.login">
      <a-input v-model="credentials.login" autoComplete="new-password"/>
    </a-form-model-item>

    <a-form-model-item label="Password" prop="ios.credentials.password">
      <a-input-password v-model="credentials.password" autoComplete="new-password"/>
    </a-form-model-item>
  </div>
</template>

<script>
  export default {
    name: "MAFISCredentialsSettings",
    model: {
      prop: 'credentials',
      event: 'change'
    },
    props: {
      credentials: {
        type: Object,
        default() {
          return {
            team: '',
            login: '',
            password: '',
          }
        }
      }
    },
    watch: {
      credentials: {
        deep: true,
        handler(newVal) {
          this.$emit('change', newVal)
        }
      }
    }
  }
</script>
