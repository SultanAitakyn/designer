<template>
  <div class="social-icon-wrapper">
  <a-button
    v-if="legacy"
    :type="type"
    :block="block"
    :size="size"
    :icon="icon ? iconName : '-'"
    @click="login"
  >{{ icon ? '' : iconName }}</a-button>
    <img
      v-else
      class="social-icon"
      src="@/assets/img/icons/facebook.svg"
      alt="facebook"
      @click="login"
    >
  </div>
</template>

<script>
/* global FB */

import { facebookAuth } from "@/requests/Auth";
import { setCredentials } from "@/requests/request";
import router from "@/router";
import buttonPropsMixin from './buttonPropsMixin';

export default {
  name: "FacebookButton",
  mixins: [buttonPropsMixin],
  data() {
    return {
      token: null,
      iconName: 'facebook',
    };
  },
  methods: {
    login() {
      const send = () => {
        facebookAuth(this.token).then(response => {
          setCredentials(response.token);
          this.$gtag.event('login', { method: 'Facebook', 'event_label': 'Facebook' });
          delete response.token;
          this.$store.commit("setUser", response);
          router.replace("/");
        });
      };
      if (this.token) {
        send();
      } else {
        FB.login(
          response => {
            if (response.status === "connected") {
              this.token = response.authResponse.accessToken;
              send();
            } else {
              this.$store.commit(
                "setErrorMessage",
                "An error occurred while logging in"
              );
            }
          },
          {
            scope: "public_profile,email",
            return_scopes: true
          }
        );
      }
    }
  },
  mounted() {
    window.fbAsyncInit = () => {
      /* eslint-disable-next-line no-undef */
      FB.init({
        appId: process.env.VUE_APP_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v6.0"
      });
      FB.getLoginStatus(
        response =>
          (this.token =
            response.status === "connected"
              ? response.authResponse.access_token
              : null)
      );
    };
    (function(d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }
};
</script>
