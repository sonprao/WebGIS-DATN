<template>
  <q-page-sticky
    ref="stickyRef"
    class="sticky"
    position="top-left"
    :offset="[760, 10]"
  >
    <q-btn-group outline color="white" style="flex-direction: column; gap: 2px">
      <q-btn
        color="teal"
        text-color="white"
        round
        icon="add"
        size="sm"
        class="circle shadow-3"
        @click="zoom('in')"
      >
        <q-tooltip  anchor="center right" self="center start">{{ $t("Zoom in") }}</q-tooltip>
      </q-btn>
      <q-space />
      <q-btn
        color="teal"
        text-color="white"
        round
        icon="remove"
        size="sm"
        class="circle shadow-3"
        @click="zoom('out')"
      >
        <q-tooltip  anchor="center right" self="center start">{{ $t("Zoom out") }}</q-tooltip>
      </q-btn>
    </q-btn-group>
  </q-page-sticky>
</template>

<script>
import {
  ref,
  unref,
  onMounted,
  defineComponent,
  getCurrentInstance,
  computed,
  inject,
} from "vue";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";

export default defineComponent({
  name: "FloatZoom",
  components: {},
  setup() {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const map = inject("map", {});
    const zoom = (direction) => {
      unref(map)
        .getView()
        .animate({
          zoom:
            unref(map).getView().getZoom() +
            (direction === "in" ? 0.5 : -0.5),
          duration: 250,
        });
    };


    return {
      vm,
      zoom,
    };
  },
});
</script>
<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
}

.sticky {
  z-index: 1;
}

.circle {
  border-radius: 50% !important;
}

</style>
