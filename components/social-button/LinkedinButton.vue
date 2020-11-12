<template>
  <div class="social-icon-wrapper">
    <a-button
      v-if="legacy"
      :type="type"
      :block="block"
      :size="size"
      :icon="icon ? iconName : '-'"
      @click="openLinkedinWindow"
    >{{ icon ? '' : iconName }}</a-button>
    <img
      v-else
      alt="linkedin"
      class="social-icon"
      src="@/assets/img/icons/linkedin.svg"
      @click="openLinkedinWindow"
    >
  </div>
</template>

<script>
import { linkedinAuth } from "@/requests/Auth";
import { setCredentials } from "@/requests/request";
import router from "@/router";
import buttonPropsMixin from './buttonPropsMixin';

export default {
  name: "LinkedinButton",
    mixins: [buttonPropsMixin],
  data() {
    return {
      clientId: process.env.VUE_APP_LINKEDIN_CLIENT_ID,
      iconName: 'linkedin',
    };
  },
  methods: {
    openLinkedinWindow() {
      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
        this.clientId
      }&redirect_uri=${window.location.origin
        .split("/")
        .join("%2F")}%2Fauth%2Flogin&scope=r_liteprofile%20r_emailaddress`;
    }
  },
  beforeMount() {
    if (this.$route.query.hasOwnProperty("code")) {
      linkedinAuth({
        code: this.$route.query.code,
        redirect_uri: `${window.location.origin}/auth/login`
      }).then(response => {
        setCredentials(response.token);
        this.$gtag.event('login', { method: 'LinkedIn', 'event_label': 'LinkedIn' });
        delete response.token;
        this.$store.commit("setUser", response);
        router.replace("/");
      });
    }
  }
};
</script>
