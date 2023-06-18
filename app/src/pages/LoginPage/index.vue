<template>
  <!-- <img src="" class="wave" alt="login-wave"> -->
  <div class="row" style="height: 90vh">
    <div class="col-0 col-md-6 flex justify-center content-center"></div>
    <div
      v-bind:class="{
        'justify-center': $q.screen.md || $q.screen.sm || $q.screen.xs,
      }"
      class="col-12 col-md-6 flex content-center"
    >
      <q-card
        v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '50%' }"
      >
        <q-card-section class="row items-start justify-center q-mt-lg">
          <q-avatar size="103px" class="absolute-center shadow-10">
            <img
              src="~assets/quasar-logo-vertical.svg"
              alt="Quasar logo"
              style="width: 64px; height: 64px"
            />
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <div class="q-pt-lg">
            <div class="col text-h6 ellipsis flex justify-center">
              <h2 class="text-h4 text-uppercase q-my-none text-weight-regular">
                {{ $t("Login") }}
              </h2>
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit.prevent="onSubmit" ref="formRef">
            <q-input
              outlined
              v-model="username"
              name="username"
              :label="$t('Username')"
              :rules="rules.username"
              lazy-rules
              @update:model-value="clearError"
            ></q-input>
            <q-input
              outlined
              v-model="password"
              type="password"
              name="password"
              autocomplete="on"
              :label="$t('Password')"
              :rules="rules.password"
              lazy-rules
              @update:model-value="clearError"
            />
            <div class="googleSection">
              <router-link class="text-primary" to="/register"
                >Register here</router-link
              >
              <q-btn
                class="full-width"
                color="primary"
                label="Login"
                type="submit"
                rounded
              ></q-btn>
              <GoogleLogin :callback="callback" popup-type="TOKEN" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, unref } from "vue";
import { decodeCredential, googleTokenLogin } from "vue3-google-login";
// import { login } from 'src/api/user'
import { useUserStore } from "stores/user";
import { login } from "src/api/user";
import { useRoute, useRouter } from "vue-router";

/*
aud:"447929018043-ms8imgr00m90hnun31pno4gm5psfacgi.apps.googleusercontent.com"
azp: "447929018043-ms8imgr00m90hnun31pno4gm5psfacgi.apps.googleusercontent.com"
email: "nguyen20dang@gmail.com"
email_verified:true
exp: 1683371336
family_name: "Đặng"
given_name: "Nguyên"
iat: 1683367736
iss:"https://accounts.google.com"
jti: "fbbad7fd9b345f9f7ee0e18d33c7a514467a3522"
name:"Nguyên Đặng"
nbf: 1683367436
picture:"https://lh3.googleusercontent.com/a/AGNmyxYO44uEPwfQwfLQ9v6NiSnPFsGzilxjRf4x1Qox=s96-c"
sub:"105643192884333657187" */
export default defineComponent({
  name: "LoginPage",
  setup() {
    const vm = getCurrentInstance().proxy;
    const router = useRouter();
    const store = useUserStore();
    const formRef = ref(null);
    const username = ref("");
    const password = ref("");
    const error = ref(null);
    const rules = {
      username: [
        (val) => !!val || "* Required",
        (val) => /^(.+)@(.+)$/.test(val) || "Invalid email address",
        () => !error.value || unref(error),
      ],
      password: [
        (val) => !!val || "* Required",
        (val) => /^(?=.*\d).{6,}$/.test(val) || "Minimum six characters",
      ],
    };
    const callback = async (responseGoogle) => {
      const userData = decodeCredential(responseGoogle.credential);
      const response = await store.loginGoogleUser({
        ...userData,
        password: "123456",
      });
      if (response) {
        router.push({ name: "HomePage" });
      }
    };

    const onSubmit = async () => {
      const response = await store.loginUser({
        email: unref(username),
        password: unref(password),
      });
      if (response instanceof Error) {
        error.value = response.response.data.error
        unref(formRef).validate();
        vm.$forceUpdate();
      }
      else if (response) {
        router.push({ name: "HomePage" });
      }
    };

    const clearError = () => {
      error.value = null
      unref(formRef).resetValidation();
      vm.$forceUpdate();
    }
    return {
      formRef,
      username,
      password,
      rules,
      callback,
      onSubmit,
      clearError,
    };
  },
});
</script>
<style lang="scss" scoped>
.wave {
  position: fixed;
  height: 100%;
  left: 0;
  bottom: 0;
  z-index: -1;
}
.googleSection {
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
