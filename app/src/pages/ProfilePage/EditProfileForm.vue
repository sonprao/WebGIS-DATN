<template>
  <q-card class="myCardClass" flat bordered>
      <q-card-section horizontal>
        <q-card-section class="q-pt-xs inputClass" style="width: 800px;">
          <div class="text-h4">{{$t("Profile")}}</div>
          <div class="text-h6">{{$t("Basic information")}}</div>
          <q-card-section horizontal>
            <q-input label="First Name" v-model="userProfile.given_name" />
            <q-input label="Last Name" v-model="userProfile.family_name" />
            <q-input label="Date of birth" v-model="userProfile.birthday" />
            <q-input label="Gender" v-model="userProfile.gender" />
          </q-card-section>
          <div class="text-h6">{{$t("Communicate information")}}</div>
          <q-card-section horizontal>
            <q-input label="Email" v-model="userProfile.email" />
            <q-input label="Phone number" v-model="userProfile.phone_number" />
          </q-card-section>
          <q-card-section horizontal>
            <q-input label="Address" v-model="userProfile.address" />
            <q-input label="Current location" v-model="userProfile.current_location" />
          </q-card-section>
        </q-card-section>
        <q-separator vertical />
        <q-card-section class="col-5 flex flex-center">
          <q-img
            class="rounded-borders"
            :src="userProfile.picture"
            style="width: 50vh; height: 50vh; border-radius: 50%;"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions class="justify-center">
        <q-btn flat color="primary" style="width: 100%;" @click="submit">
          {{$t("Submit")}}
        </q-btn>
      </q-card-actions>
    </q-card>
  <!-- <q-card>
    <q-card-section>
        <div class="text-h4">{{$t("Edit Profile")}}</div>
      </q-card-section>
    <q-form class="formClass">
      <q-card-section>
        <q-input type="text" label="Username" v-model="userProfile.username" />
        <q-input type="email" label="Email" v-model="userProfile.email" />
        <q-input type="email" label="Email" v-model="userProfile.email" />
      </q-card-section>
      <q-card-section>
        <q-input type="text" label="Last Name" v-model="userProfile.family_name" />
        <q-input type="text" label="First Name" v-model="userProfile.given_name" />
      </q-card-section>
      <q-card-section>
        <q-input type="text" label="Address" v-model="userProfile.address" />
      </q-card-section>
      <q-card-section>
        <q-input type="text" label="City" v-model="userProfile.city" />
        <q-input type="text" label="Country" v-model="userProfile.country" />
      </q-card-section>
      <q-separator />
      <q-card-actions class="justify-center">
        <q-btn flat color="primary">{{$t("Change")}}</q-btn>
        <q-btn flat>Action 2</q-btn>
      </q-card-actions>
    </q-form>
  </q-card> -->
</template>
<script>
import {
  defineComponent,
  ref,
  unref,
  onMounted,
  getCurrentInstance,
} from "vue";
import { useUserStore } from "stores/user";
import { updateProfile } from 'src/api/profile'
import _isEqual from 'lodash/isEqual'
import _cloneDeep from 'lodash/cloneDeep'
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
  name: "EditProfileForm",
  setup() {
    const userstore = useUserStore();
    const user = userstore.getUser;
    const userProfile = ref(_cloneDeep(user.profile));
    const submit = async () => {
      if (!_isEqual(unref(userProfile), userstore.getUser.profile)) {
        try {
          const response = await updateProfile({id: user.id , profile: unref(userProfile)})
          userstore.setProfile(response)
        } catch (e) {
          console.log(e)
        }
      }
    };
    return {
      userProfile,
      submit,
    };
  },
});
</script>
<style lang="scss" scoped>
.inputClass {
  .q-card__section--horiz {
    // display: flex;
    gap: 50px;
    margin-bottom: 5px;
  }
}
</style>
