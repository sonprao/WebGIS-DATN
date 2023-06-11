<template>
  <q-page-sticky class="stickyClass" position="top-left" :offset="[10, 10]">
    <q-card class="my-card" flat bordered style="width: 250px">
      <q-tabs v-model="tab" class="text-primary">
        <q-tab
          label="Tab one"
          name="one"
          @click="
            () => {
              expanded = true;
            }
          "
        />
        <q-tab
          label="Tab two"
          name="two"
          @click="
            () => {
              expanded = true;
            }
          "
        />
        <q-btn
          flat
          dense
          color="grey"
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          style="height: 100%"
          @click="expanded = !expanded"
        />
      </q-tabs>
      <q-separator />
      <q-slide-transition>
        <div v-show="expanded">
          <q-tab-panels v-model="tab" animated :keep-alive="true" :keep-alive-include="['one', 'two']">
            <q-tab-panel name="one" style="padding: 0; display: grid">
              <tab-action />
            </q-tab-panel>
            <q-tab-panel name="two">
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-slide-transition>
    </q-card>
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
import tabAction from 'src/components/floatControl/tabAction.vue';
export default defineComponent({
  name: "FloatControl",
  components: {
    tabAction,
  },
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
  emits: ["closePopup"],
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;

    const tab = ref("one");
    const expanded = ref(false);
    return {
      vm,
      tab,
      expanded,
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

.stickyClass {
  z-index: 1;
}
</style>
