<template>
  <div class="social-icon-wrapper">
    <a-button
      v-if="legacy"
      :type="type"
      :block="block"
      :size="size"
      :icon="icon ? iconName : '-'"
      :id="buttonId"
    >{{ icon ? '' : iconName }}</a-button>
    <img
      v-else
      :id="buttonId"
      class="social-icon"
      src="@/assets/img/icons/google.svg"
      alt="google"
    >
  </div>
</template>

<script>
/* global gapi */

import { googleAuth } from "@/requests/Auth";
import { setCredentials } from "@/requests/request";
import router from "@/router";
import buttonPropsMixin from './buttonPropsMixin';

export default {
  name: "GoogleButton",
  mixins: [buttonPropsMixin],
  data() {
    return {
      iconName: 'google',
      buttonId: 'google-button'
    }
  },
  mounted() {
    const script = document.createElement("script");
    script.onload = () => {
      gapi.load("auth2", () => {
        const auth2 = window.gapi.auth2.init({
          client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID
        });
        auth2.attachClickHandler(
          document.getElementById(this.buttonId),
          {},
          googleUser => {
            googleAuth(googleUser.getAuthResponse().id_token).then(response => {
              setCredentials(response.token);
              this.$gtag.event('login', { method: 'Google', 'event_label': 'Google' });
              delete response.token;
              this.$store.commit("setUser", response);
              router.replace("/");
            });
          },
          () => {
            this.$store.commit(
              "setErrorMessage",
              "An error occurred while logging in"
            );
          }
        );
      });
    };
    script.src = "https://apis.google.com/js/api:client.js";
    document.head.appendChild(script);
  }
};
</script>
