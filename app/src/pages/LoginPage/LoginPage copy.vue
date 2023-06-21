<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="fit" style="max-width: 400px">
          <q-card-section class="row items-start justify-center q-mt-lg">
            <img
              src="~assets/quasar-logo-vertical.svg"
              alt="Quasar logo"
              style="width: 64px; height: 64px"
            />
          </q-card-section>

          <q-form v-model="form" @submit="onSubmit">
            <q-card-section>
              <div class="q-gutter-md">
                <q-input
                  outlined
                  v-model="username"
                  name="username"
                  label="Username"
                  :rules="rules.username"
                  lazy-rules
                ></q-input>

                <q-input
                  outlined
                  v-model="password"
                  type="password"
                  name="password"
                  autocomplete="on"
                  label="Password"
                  :rules="rules.password"
                  lazy-rules
                />
              </div>
            </q-card-section>
            <q-card-section class="googleSection">
              <a href="google.com" >Register here!</a>
              <q-btn :label="$t('Login')" type="submit" color="primary" />
              <GoogleLogin :callback="callback" popup-type="TOKEN" />
            </q-card-section>
          </q-form>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, unref } from "vue";
import { decodeCredential, googleTokenLogin  } from "vue3-google-login";
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
    const router = useRouter();
    const store = useUserStore();

    const form = {
      valid: true,
    };
    const username = ref("");
    const password = ref("");
    const rules = {
      username: [
        val => !!val || '* Required',
        val =>
          (/^(.+)@(.+)$/).test(val) ||
          'Invalid email address',
      ], 
      password: [
        val => !!val || '* Required',
        val =>
          (/^(?=.*\d).{6,}$/).test(val) ||
          'Minimum six characters',
      ]
    }
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
      if (response) {
        router.push({ name: "HomePage" });
      }
    };
    return {
      form,
      username,
      password,
      rules,
      callback,
      onSubmit,
    };
  },
});
</script>
<style scoped>
.googleSection {
  padding-top: 0;
  margin-top: 0;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
