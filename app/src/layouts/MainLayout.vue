<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> GIS App </q-toolbar-title>

        <q-select
          ref="languageRef"
          emit-value
          map-options
          options-dense
          style="min-width: 150px; padding: 0 10px"
          :label="$t('Language')"
          v-model="locale"
          :options="localeOptions"
          @popup-hide="blur"
        >
          <template v-slot:prepend>
            <q-icon name="translate" />
          </template>
        </q-select>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      elevated
      side="left"
      behavior="desktop"
    >
      <q-list>
        <q-item-label header></q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        <q-separator />
        <EssentialLink
          v-for="link in userIntecraction"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { getCurrentInstance, defineComponent, ref, unref, computed } from "vue";

import EssentialLink from "components/EssentialLink.vue";
import { useI18n } from "vue-i18n";
import { i18n } from "boot/i18n.js";

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const vm = getCurrentInstance().proxy;
    const { locale } = useI18n({ useScope: "global" });
    const $t = i18n.global.t;
    const leftDrawerOpen = ref(false);
    const localeOptions = computed(() => [
      { value: "en-US", label: $t("English") },
      { value: "vn-VN", label: $t("Vietnamese") },
    ]);
    const languageRef = ref(null);
    const blur = () => {
      unref(languageRef).blur();
    };
    const linksList = computed(() => [
      {
        title: $t("Map"),
        icon: "straighten",
        to: "/map",
      },
      {
        title: "Github",
        caption: "github.com/sonprao/WebGIS-DATN",
        icon: "code",
        link: "https://github.com/sonprao/WebGIS-DATN",
      },
    ]);
     const userIntecraction = computed(() => [
      {
        title: $t("Profile"),
        icon: "account_circle",
        to: "/profile",
      },
      {
        title: $t("Logout"),
        icon: "logout",
        to: "/logout",
      },
    ]);

    return {
      vm,
      languageRef,
      blur,
      locale,
      localeOptions,
      essentialLinks: linksList,
      userIntecraction,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
