<template>
  <div>
    <q-input v-if="defaultOptions.length > 0" class="searchClass" :label="$t('Search layer')" v-model="searchLayer" @update:model-value="onSearch"/>
    <q-checkbox v-if="dataLayers.length > 0" v-model="layerCheckAll" :val="true" color="primary" label="Select All"
      @update:model-value="selectAll" />
    <q-list overlay>
      <q-scroll-area class="layerClass"
        :thumb-style="thumbStyle" :bar-style="barStyle">
        <q-item v-for="(item, index) of dataLayers" :key="item.id + index">
          <q-item-section avatar>
            <q-checkbox v-model="layerCheckbox" :val="item" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <span v-html="item.name"></span>
            </q-item-label>
            <q-item-label caption>
              {{ item.description }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn v-if="layerCheckbox.includes(item)" flat dense round size="12px" class="gt-xs"
                icon="center_focus_strong" @click="actionFocusLayer(item.vectorLayer)" />
            </div>
          </q-item-section>
          <q-separator />
        </q-item>
      </q-scroll-area>
      <!-- </q-virtual-scroll> -->
    </q-list>
  </div>
</template>

<script>
import {
  getCurrentInstance,
  defineComponent,
  ref,
  unref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  provide,
  inject,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { i18n } from "boot/i18n.js";
import { useMapStore } from "stores/map";

import { Map, View } from "ol";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";

import _difference from "lodash/difference";
import _isEmpty from "lodash/isEmpty";
import { MAP_LAYERS } from "src/constants/layer.js";
import {
  actionAddLayerGeoJSON,
  actionAddLayerWMS,
  transformProjection,
} from "src/utils/openLayers.js";
export default defineComponent({
  name: "TabLocation",
  components: {},
  setup() {
    const vm = getCurrentInstance().proxy;
    const $t = i18n.global.t;
    const mapStore = useMapStore();
    const map = inject("map", {});
    const searchLayer = ref('');
    const onSearch = (val) => {
      const _val = val.toLowerCase()
      dataLayers.value = unref(defaultOptions).filter(
        (opt) => opt.name.toLowerCase().includes(_val))
    }
    const defaultOptions = ref([]);
    const location = computed(() => mapStore.getLocation);
    const dataLayers = ref([]);
    const layerCheckbox = ref([]);
    const layerCheckAll = ref([]);
    const selectAll = (value, event) => {
      if (value[0]) {
        layerCheckbox.value = unref(dataLayers);
      } else {
        layerCheckbox.value = [];
      }
    };
    const onClearSearch = () => {
      dataLayers.value = [];
      layerCheckbox.value = [];
      layerCheckAll.value = [];
    };
    const setModel = async (val) => {
      if (val) {
        onClearSearch();
        dataLayers.value = unref(location)?.mapLayers || [];
        defaultOptions.value = unref(dataLayers)
      } else {
      }
    };
    const actionFocusLayer = (vectorLayer) => {
      const extent = vectorLayer?.getSource?.()?.getExtent?.();
      unref(map)
        .getView()
        .fit(extent, {
          padding: [250, 250, 250, 250],
          duration: 1000,
        });
    };
    onMounted(() => {
      console.log("TabLocation mounted");
      if (!_isEmpty(unref(location))) {
        setModel(unref(location))
      }
      watch(
        () => layerCheckbox.value,
        (newVal, oldVal) => {
          if (newVal.length > oldVal.length) {
            const diff = _difference(newVal, oldVal);
            const { workspace } = unref(location);
            diff.forEach((layer) => {
              const currentLayer = unref(dataLayers).find(
                (l) => layer.id === l.id
              );
              if (currentLayer.vectorLayer) {
                layer.vectorLayer?.setVisible?.(true);
              } else {
                currentLayer.vectorLayer = actionAddLayerGeoJSON({
                  layer,
                  workspace,
                  map,
                });
                // currentLayer.vectorLayer = actionAddLayerWMS({ layer, workspace, map })
              }
            });
          } else {
            const diff = _difference(oldVal, newVal);
            const { workspace } = unref(location);
            diff.forEach((layer) => {
              if (layer.vectorLayer) {
                layer.vectorLayer?.setVisible?.(false);
              }
            });
          }
        }
      );
      watch(
        () => location.value,
        (newVal, oldVal) => {
          setModel(newVal)
        }
      );
    });
    onUnmounted(() => {
      console.log("unmounted");
    });
    return {
      map,
      location,
      searchLayer,
      onSearch,
      setModel,
      defaultOptions,
      dataLayers,
      layerCheckbox,
      layerCheckAll,
      selectAll,
      actionFocusLayer,
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
.searchClass {
}

.layerClass {
  border-top-left-radius: 1px;
  border-top-right-radius: 1px;
  min-height: 0;
  height: 100vh;
  max-height: 55vh;
  max-width: 300px;

  .q-scrollarea__content.absolute {
    // display: flex;
    // flex-direction: column-reverse;
  }
}

::-webkit-scrollbar {
  height: 12px;
  width: 14px;
  background: transparent;
  z-index: 12;
  overflow: visible;
  cursor: pointer !important;
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
  cursor: pointer !important;
}

::-webkit-scrollbar-thumb:hover {
  background: $secondary;
  cursor: pointer !important;
}
</style>
