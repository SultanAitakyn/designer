<template>
  <div>
    <a-form-model-item label="Locale">
      <a-select v-model="selectedLocaleValue" firstActiveValue="en-US" @select="localeSelected">
        <a-select-opt-group label="Localized">
          <a-select-option v-for="locale of localized" :key="locale.value" :value="locale.value">
            {{ locale.label }}
          </a-select-option>
        </a-select-opt-group>

        <a-select-opt-group label="Not localized">
          <a-select-option v-for="locale of notLocalized" :key="locale.value" :value="locale.value">
            {{ locale.label }}
          </a-select-option>
        </a-select-opt-group>
      </a-select>
    </a-form-model-item>

    <template v-if="locales[selectedLocaleIndex]">
      <a-form-model-item label="Name" :prop="`ios.metadata.locales.${selectedLocaleIndex}.name`">
        <a-input v-model="locales[selectedLocaleIndex].name"/>
      </a-form-model-item>

      <a-form-model-item label="Subtitle" :prop="`ios.metadata.locales.${selectedLocaleIndex}.subtitle`">
        <a-input v-model="locales[selectedLocaleIndex].subtitle"/>
      </a-form-model-item>

      <a-form-model-item label="Description" :prop="`ios.metadata.locales.${selectedLocaleIndex}.description`">
        <a-textarea v-model="locales[selectedLocaleIndex].description"/>
      </a-form-model-item>

      <a-form-model-item label="Promo" :prop="`ios.metadata.locales.${selectedLocaleIndex}.promo`">
        <a-textarea v-model="locales[selectedLocaleIndex].promo"/>
      </a-form-model-item>

      <a-form-model-item label="Release notes" :prop="`ios.metadata.locales.${selectedLocaleIndex}.release_notes`">
        <a-textarea v-model="locales[selectedLocaleIndex].release_notes"/>
      </a-form-model-item>

      <a-form-model-item label="Keywords" :prop="`ios.metadata.locales.${selectedLocaleIndex}.keywords`">
        <a-textarea v-model="locales[selectedLocaleIndex].keywords"/>
      </a-form-model-item>

      <a-form-model-item label="Privacy URL" :prop="`ios.metadata.locales.${selectedLocaleIndex}.privacy_url`">
        <a-input v-model="locales[selectedLocaleIndex].privacy_url" type="url"/>
      </a-form-model-item>

      <a-form-model-item label="Marketing URL" :prop="`ios.metadata.locales.${selectedLocaleIndex}.marketing_url`">
        <a-input v-model="locales[selectedLocaleIndex].marketing_url" type="url"/>
      </a-form-model-item>

      <a-form-model-item label="Support URL" :prop="`ios.metadata.locales.${selectedLocaleIndex}.support_url`">
        <a-input v-model="locales[selectedLocaleIndex].support_url" type="url"/>
      </a-form-model-item>
    </template>
  </div>
</template>

<script>
  export default {
    name: "MAFISLocalesSettings",

    model: {
      prop: 'locales',
      event: 'change',
    },

    props: {
      locales: {
        type: Array,
        default() {
          return [
            {
              locale: 'en-US',
              name: '',
              subtitle: '',
              description: '',
              promo: '',
              release_notes: '',
              keywords: '',
              privacy_url: '',
              marketing_url: '',
              support_url: '',
            }
          ]
        }
      }
    },

    data() {
      return {
        localesEnums: [
          {value: 'ar-SA', label: 'Arabic - Saudi Arabia'},
          {value: 'ca', label: 'Catalan'},
          {value: 'cs', label: 'Czech'},
          {value: 'da', label: 'Danish'},
          {value: 'de-DE', label: 'German - Germany'},
          {value: 'en-US', label: 'English - United States'},
        ],
        selectedLocaleValue: 'en-US'
      }
    },

    computed: {
      localized() {
        return this.localesEnums.filter(le => this.locales.some(l => l.locale === le.value))
      },
      notLocalized() {
        return this.localesEnums.filter(le => !this.locales.some(l => l.locale === le.value))
      },
      selectedLocaleIndex() {
        return this.locales.findIndex(l => l.locale === this.selectedLocaleValue)
      }
    },

    watch: {
      locales: {
        deep: true,
        handler(newVal) {
          this.$emit('change', newVal)
        }
      }
    },

    mounted() {
      if (!this.locales.some(l => l.locale === 'en-US')) {
        this.locales.push({
          locale: 'en-US',
          name: '',
          subtitle: '',
          description: '',
          promo: '',
          release_notes: '',
          keywords: '',
          privacy_url: '',
          marketing_url: '',
          support_url: '',
        })
      }
    },

    methods: {
      localeSelected(e) {
        if (!this.locales.some(l => l.locale === e)) {
          this.locales.push({
            locale: e,
            name: '',
            subtitle: '',
            description: '',
            promo: '',
            release_notes: '',
            keywords: '',
            privacy_url: '',
            marketing_url: '',
            support_url: '',
          })
        }
      }
    }
  }
</script>
