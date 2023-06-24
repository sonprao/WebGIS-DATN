<template>
  <q-page-sticky class="stickyClass" position="top-right" :offset="[10, 10]">
    <q-card class="my-card" flat bordered style="width: 400px">
      <div :style="styleImage">
        <q-btn
          class="absolute shadow-2 closeClass"
          round
          color="white"
          text-color="black"
          icon="close"
          size="sm"
          style="top: 10px; left: 10px;"
          @click="closeCard"
        />
      </div>
      <q-card-section>
        <q-btn
          fab
          color="primary"
          icon="place"
          class="absolute"
          style="top: 0; right: 12px; transform: translateY(-50%)"
        />

        <div class="row no-wrap items-center">
          <div class="col text-h6 ellipsis">{{title}}</div>
          <div
            class="col-auto text-grey text-caption q-pt-md row no-wrap items-center"
          >
            <q-icon name="place" />
            {{ distanceToMyLocation }}
          </div>
        </div>

      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-subtitle1">$・Italian, Cafe</div>
        <div class="text-caption text-grey">
          Small plates, salads & sandwiches in an intimate setting.
        </div>
      </q-card-section>

      <q-separator />

      <!-- <q-card-actions>
        <q-btn flat round icon="event" />
        <q-btn flat color="primary"> Reserve </q-btn>
      </q-card-actions> -->
      <q-tabs v-model="detailTab" class="bg-teal text-white">
        <q-tab v-for="(tab, index) of detailTabList"
          :key="index"
          :label="tab.label"
          :name="tab.component"
          @click="() => {
            tabExpanded = true;
          }
          " />
        <q-btn flat dense :icon="tabExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" style="height: 100%"
          @click="tabExpanded = !tabExpanded" />
      </q-tabs>
      <q-separator />
      <q-slide-transition>
        <div v-show="tabExpanded">
          <q-tab-panels v-model="detailTab" animated :keep-alive="true" class="shadow-10 rounded-borders">
            <q-tab-panel
              v-for="(tab, index) of detailTabList"
              :key="index"
              :name="tab.component"
              class="panelClass"
            >
            <div v-html="tab.content"></div>
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
  createApp,
  h,
} from "vue";
import { QBtn } from "quasar";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import { $bus } from "boot/bus.js";

export default defineComponent({
  name: "FloatDetail",
  props: {
    value: Boolean,
    content: String,
    distance: Number,
  },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;

    const imageCapture = ref('https://cdn.quasar.dev/img/chicken-salad.jpg')
    const styleImage = computed(() => ({
      backgroundImage: `url(${unref(imageCapture)})`,
      backgroundSize: 'cover',
      minHeight: '200px',
    }))
    const detailTab = ref("tab-properties");
    const tabExpanded = ref(true);
    const detailTabList = computed(() => [
      {
        label: $t('Properties'),
        component: 'tab-properties',
        content: props.content === null ? "" : props.content.replaceAll("null", "Updating"),
      },
      {
        label: $t('Location'),
        component: 'tab-location',
      },
    ])
    const closeCard = () => {
      console.log("hehe");
      $bus.emit("close-float-detail", true);
      emit("update:model-value", false);
    };
    const distanceToMyLocation = computed(() => {
      return props.distance + "m";
    });
    const title = "Cafe Basilico"
    const containerRef = ref(null);
    const renderDynamicComponent = ref(null);
    // const ComponentToRender = h(
    //     'div',
    //     { id: 'foo', class: 'bar' },
    //     ['text content']
    // )
    const ComponentToRender = h(
      QBtn,
      // { id: 'foo', class: 'bar' },
      ["text content"]
    );

    return {
      vm,
      styleImage,
      detailTab,
      detailTabList,
      tabExpanded,
      title,
      distanceToMyLocation,
      containerRef,
      closeCard,
      ComponentToRender,
      renderDynamicComponent,
    };
  },
});
</script>
<style lang="scss" scoped>
html,
body {
  width: 100%;
  height: 100%;
}

.stickyClass {
  z-index: 1;
}

.panelClass {
  max-height: 200px;
  padding: 10px 20px;
  display: grid;
}

.closeClass {
  cursor: pointer;
}

::-webkit-scrollbar {
  height: 12px;
  width: 14px;
  background: transparent;
  z-index: 12;
  overflow: visible;
  cursor: auto !important;
}

::-webkit-scrollbar-thumb {
  width: 10px;
  background-color: $secondary;
  border-radius: 10px;
  z-index: 12;
  border: 4px solid rgba(0, 0, 0, 0);
  background-clip: padding-box;
  transition: background-color 0.32s ease-in-out;
  margin: 4px;
  min-height: 32px;
  min-width: 32px;
  cursor: auto !important;
}

::-webkit-scrollbar-thumb:hover {
  background: $secondary;
  cursor: auto !important;
}
</style>
