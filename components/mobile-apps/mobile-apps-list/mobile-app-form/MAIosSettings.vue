<template>
  <a-tabs default-active-key="1" tabPosition="left" size="small">
    <a-tab-pane key="1" tab="Metadata">
      <a-form-model-item label="Light status bar" prop="ios.light_status_bar">
        <a-switch v-model="ios.light_status_bar"/>
      </a-form-model-item>

      <a-form-model-item label="Large title" prop="ios.large_title">
        <a-switch v-model="ios.large_title"/>
      </a-form-model-item>

      <a-form-model-item label="Primary category" prop="ios.metadata.primary_category">
        <a-select v-model="ios.metadata.primary_category">
          <a-select-option v-for="category of categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="Primary category" prop="ios.metadata.secondary_category">
        <a-select v-model="ios.metadata.secondary_category">
          <a-select-option v-for="category of categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="Price tier" prop="ios.metadata.price_tier">
        <a-select v-model="ios.metadata.price_tier">
          <a-select-option v-for="tier of priceTiers" :key="tier.value" :value="tier.value">
            {{ tier.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item label="Copyright" prop="ios.metadata.copyright">
        <a-input v-model="ios.metadata.copyright"/>
      </a-form-model-item>
    </a-tab-pane>

    <a-tab-pane key="2" tab="Locales">
      <MAFISLocalesSettings v-model="ios.metadata.locales"/>
    </a-tab-pane>

    <a-tab-pane key="3" tab="Review">
      <MAFISReviewSettings v-model="ios.metadata.review"/>
    </a-tab-pane>

    <a-tab-pane key="4" tab="Credentials">
      <MAFISCredentialsSettings v-model="ios.credentials"/>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
  import MAFISCredentialsSettings
    from "@/components/mobile-apps/mobile-apps-list/mobile-app-form/ma-ios-settings/MAFISCredentialsSettings";
  import MAFISLocalesSettings
    from "@/components/mobile-apps/mobile-apps-list/mobile-app-form/ma-ios-settings/MAFISLocalesSettings";
  import MAFISReviewSettings
    from "@/components/mobile-apps/mobile-apps-list/mobile-app-form/ma-ios-settings/MAFISReviewSettings";

  export default {
    name: "MAIosSettings",

    components: {
      MAFISLocalesSettings,
      MAFISCredentialsSettings,
      MAFISReviewSettings
    },

    model: {
      prop: 'ios',
      event: 'change'
    },

    props: {
      ios: {
        type: Object,
        default() {
          return {
            light_status_bar: false,
            large_title: false,
            metadata: {
              primary_category: '',
              secondary_category: '',
              price_tier: 0,
              copyright: '',
              locales: [],
              review: {},
            },
            credentials: {}
          }
        }
      }
    },

    data() {
      return {
        priceTiers: [
          {value: 0, label: 'Free app'},
        ],
        categories: [
          {value: 'Book', label: 'Books'},
          {value: 'Business', label: 'Business'},
          {value: 'Apps.Catalogs', label: 'Catalogs'},
          {value: 'Education', label: 'Education'},
          {value: 'Entertainment', label: 'Entertainment'},
          {value: 'Finance', label: 'Finance'},
          {value: 'Apps.Food_Drink', label: 'Food drink'},
          {value: 'Healthcare_Fitness', label: 'Healthcare fitness'},
          {value: 'LIFESTYLE', label: 'Lifestyle'},
          {value: 'Medical', label: 'Medical'},
          {value: 'Music', label: 'Music'},
          {value: 'Navigation', label: 'Navigation'},
          {value: 'News', label: 'News'},
          {value: 'Apps.Newsstand', label: 'News stand'},
          {value: 'Photography', label: 'Photography'},
          {value: 'PRODUCTIVITY', label: 'Productivity'},
          {value: 'Reference', label: 'Reference'},
          {value: 'Apps.Shopping', label: 'Shopping'},
          {value: 'SocialNetworking', label: 'Social networking'},
          {value: 'Sports', label: 'Sports'},
          {value: 'Stickers', label: 'Stickers'},
          {value: 'Travel', label: 'Travel'},
          {value: 'Utilities', label: 'Utilities'},
          {value: 'Weather', label: 'Weather'},
        ]
      }
    },

    watch: {
      ios: {
        deep: true,
        handler(newVal) {
          this.$emit('change', newVal)
        },
      }
    }
  }
</script>
