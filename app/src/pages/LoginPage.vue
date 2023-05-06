<template>
  <q-page class="flex flex-center">
    <q-card class="fit" style="max-width: 400px;">
      <q-card-section class="row items-start justify-center q-mt-lg">
        <img src="~assets/quasar-logo-vertical.svg" alt="Quasar logo" style="width: 64px; height: 64px;">
      </q-card-section>
      
      <q-form v-model="form"  @submit="onSubmit">
        <q-card-section>
          <div class="q-gutter-md">
            <q-input outlined v-model="username" label="Username"></q-input>

            <q-input outlined v-model="password" type="password" label="Password"></q-input>
          </div>
        </q-card-section>

        <q-card-section>
          <GoogleLogin :callback="callback" popup-type="TOKEN"/>
          <q-btn label="Submit" type="submit" color="primary"/>
        </q-card-section>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, unref } from 'vue'; 
import { decodeCredential } from 'vue3-google-login'
import {login} from 'src/api/user'
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
  name: 'LoginPage',
  setup() {
    const form = {
      valid: true
    }
    const username = ref('')
    const password = ref('')
    const callback = async(response) => {
      const userData = decodeCredential(response.credential)
      console.log("Handle the userData", userData)
      const responseData = await login({
        email: userData.email,
        sub: userData.sub,
        name: userData.name,
        given_name: userData.given_name,
        family_name: userData.family_name,
      })
      console.log(responseData)
    }
    const onSubmit = async() => {
     
      console.log(unref(username))
      console.log(unref(password))
    }
    return {
      form,
      username,
      password,
      callback,
      onSubmit,
    };
  },
});
</script>
