<template>
  <q-layout container style="height: 93vh; padding: 0">
    <q-page-container class="mapContainer">
      <router-view :key="search?.id" />
    </q-page-container>
  </q-layout>
</template>

<script>
import {
  getCurrentInstance,
  defineComponent,
  ref,
  unref,
  computed,
  onUnmounted,
  provide,
} from "vue";
import { useRoute, useRouter } from "vue-router";

import { useI18n } from "vue-i18n";
import { i18n } from "boot/i18n.js";
import { getAllLocation, getLocation } from "src/api/location";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const vm = getCurrentInstance().proxy;
    const $t = i18n.global.t;
    const route = useRoute();
    const router = useRouter();
    const locationSearchRef = ref(null);
    const search = ref("");
    const hint = ref("");
    const options = ref([]);
    const location = ref(null);
    provide('location', location);
    const setModel = async (val) => {
      if (val) {
        location.value = await getLocation({ id: val.id });
        unref(locationSearchRef).blur();
        hint.value = `${$t("Location")}: ${val.name}`;
        router.push({ name: "DetailPage", params: { id: val.id } });
      } else {
        hint.value = null;
        router.push({ name: "NoMapPage" });
      }
    };
    onUnmounted(() => {
      console.log("unmounted");
    });
    return {
      locationSearchRef,
      search,
      hint,
      options,
      setModel,
    };
  },
});
</script>
<style>
.mapContainer {
  padding: 0 !important;
}
</style>
