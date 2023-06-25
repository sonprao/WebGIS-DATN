<template>
  <q-page-sticky class="stickyClass" position="top-right" :offset="[10, 10]">
    <q-card class="my-card" flat bordered style="width: 400px">
      <!-- <div :style="styleImage">
        <q-btn
          class="absolute shadow-2 closeClass"
          round
          color="white"
          text-color="black"
          icon="close"
          size="sm"
          style="top: 10px; left: 10px"
          @click="closeCard"
        />
      </div> -->
      <q-carousel swipeable animated v-model="slideImage" control-color="secondary" arrows navigation infinite
        ref="carousel" style="height: 200px;">
        <q-carousel-slide :name="1" :img-src="image" />
        <q-carousel-slide :name="2" :img-src="image" />
        <q-carousel-slide :name="3" :img-src="image" />
        <template v-slot:control>
          <q-carousel-control position="top-left" class="text-white rounded-borders">
            <q-btn class="absolute shadow-2 closeClass" round color="white" text-color="black" icon="close" size="sm"
              @click="closeCard" />
          </q-carousel-control>
        </template>
      </q-carousel>
      <q-card-section>
        <q-btn fab color="primary" icon="place" class="absolute"
          style="top: 0; right: 12px; transform: translateY(-50%)" />

        <div class="row no-wrap items-center">
          <div class="col text-h6 ellipsis">{{ title }}</div>
          <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
            <q-icon name="place" />
            {{ distanceToMyLocation }}
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="coordinate" class="q-pt-none">
        <div class="text-subtitle1">
          <q-icon name="place" /> {{ coordinate }}
        </div>
      </q-card-section>
      <q-separator />
      <q-tabs v-model="detailTab" class="bg-teal text-white">
        <q-tab v-for="(tab, index) of detailTabList" :key="index" :label="tab.label" :name="tab.component" @click="() => {
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
            <q-tab-panel v-for="(tab, index) of detailTabList" :key="index" :name="tab.component" class="panelClass">
              <q-scroll-area
              style="height: 200px; max-width: 400px; padding: 0 10px;"
               :thumb-style="thumbStyle"
               :bar-style="barStyle"
               >
                <div v-html="tab.content"></div>
              </q-scroll-area>
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
  inject,
} from "vue";
import html2canvas from "html2canvas";
import { QBtn } from "quasar";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import { Map, View, Overlay } from "ol";
import { $bus } from "boot/bus.js";
export default defineComponent({
  name: "FloatDetail",
  props: {
    value: Boolean,
    title: String,
    content: {
      type: String,
    },
    image: {
      type: String,
      default: "https://cdn.quasar.dev/img/chicken-salad.jpg",
    },
    distance: {
      type: Number,
      default: 0,
    },
    coordinate: {
      type: String,
      default: null,
    }
  },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const slideImage = ref(1);
    const styleImage = computed(() => ({
      backgroundImage: `url(${props.image})`,
      backgroundSize: "400px 200px",
      height: "200px",
    }));
    const map = inject("map", {});
    const detailTab = ref("tab-properties");
    const tabExpanded = ref(true);
    const detailTabList = computed(() => [
      {
        label: $t("Properties"),
        component: "tab-properties",
        content: props.content,
      },
      {
        label: $t("Location"),
        component: "tab-location",
      },
    ]);
    const closeCard = () => {
      console.log("hehe");
      $bus.emit("close-float-detail", true);
      emit("update:model-value", false);
    };
    const distanceToMyLocation = computed(() => {
      return props.distance;
    });
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
      map,
      slideImage,
      styleImage,
      detailTab,
      detailTabList,
      tabExpanded,
      distanceToMyLocation,
      containerRef,
      closeCard,
      ComponentToRender,
      renderDynamicComponent,
      thumbStyle: {
        right: '4px',
        borderRadius: '5px',
        backgroundColor: 'teal',
        width: '5px',
        opacity: 0.75
      },
      barStyle: {
        right: '2px',
        borderRadius: '9px',
        backgroundColor: 'teal',
        width: '9px',
        opacity: 0.2
      }
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
  // padding: 10px 20px;
  // display: grid;
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
