<template>
  <q-page-sticky
    ref="stickyRef"
    class="sticky"
    position="bottom-right"
    :offset="[10, 40]"
  >
    <q-btn-group outline color="white" style="flex-direction: column; gap: 2px">
      <q-btn
        color="white"
        text-color="black"
        round
        icon="add"
        class="circle"
        @click="zoom('in')"
      >
        <q-tooltip>{{ $t("Zoom in") }}</q-tooltip>
      </q-btn>
      <q-space />
      <q-btn
        color="white"
        text-color="black"
        round
        icon="remove"
        class="circle"
        @click="zoom('out')"
      >
        <q-tooltip>{{ $t("Zoom out") }}</q-tooltip>
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
} from "vue";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";

export default defineComponent({
  name: "FloatZoom",
  components: {},
  props: {
    map: {
      type: Object,
      default: () => ({}),
    },
    view: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;

    const zoom = (direction) => {
      unref(props.map)
        .getView()
        .animate({
          zoom:
            unref(props.map).getView().getZoom() +
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