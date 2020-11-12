<template>
  <div>
    <a-form-model-item label="First Name" prop="ios.metadata.review.first_name">
      <a-input v-model="review.first_name"/>
    </a-form-model-item>

    <a-form-model-item label="Last Name" prop="ios.metadata.review.last_name">
      <a-input v-model="review.last_name"/>
    </a-form-model-item>

    <a-form-model-item label="Phone" prop="ios.metadata.review.phone">
      <a-input v-model="review.phone" type="tel"/>
    </a-form-model-item>

    <a-form-model-item label="Email" prop="ios.metadata.review.email">
      <a-input v-model="review.email" type="email"/>
    </a-form-model-item>

    <a-form-model-item label="User" prop="ios.metadata.review.user">
      <a-input v-model="review.user" autoComplete="new-password"/>
    </a-form-model-item>

    <a-form-model-item label="Password" prop="ios.metadata.review.password">
      <a-input-password v-model="review.password" autoComplete="new-password"/>
    </a-form-model-item>

    <a-form-model-item label="Notes" prop="ios.metadata.review.notes">
      <a-textarea v-model="review.notes"/>
    </a-form-model-item>
  </div>
</template>

<script>
  export default {
    name: "MAFISReviewSettings",
    model: {
      prop: 'review',
      event: 'change'
    },
    props: {
      review: {
        type: Object,
        default() {
          return {
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            user: '',
            password: '',
            notes: ''
          }
        }
      }
    },
    watch: {
      review: {
        deep: true,
        handler(newVal) {
          this.$emit('change', newVal)
        }
      }
    }
  }
</script>
