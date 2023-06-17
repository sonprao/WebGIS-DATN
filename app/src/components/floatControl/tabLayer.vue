<template>
  <div>
    <q-select
      ref="locationSearchRef"
      v-model="search"
      use-input
      clearable
      hide-dropdown-icon
      input-debounce="400"
      label="Select location"
      option-label="name"
      option-value="name"
      :hint="hint"
      :options="options"
      @filter="filterFn"
      @update:model-value="setModel"
      style="margin: 10px"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ $t("No results") }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-separator />
    <q-list overlay>
      <q-checkbox
        v-if="dataLayers.length > 0"
        v-model="layerCheckAll"
        :val="true"
        color="primary"
        label="Select All"
        @update:model-value="selectAll"
        />
      <q-scroll-area class="layerClass">
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
              <q-btn
                v-if="layerCheckbox.includes(item)"
                flat
                dense
                round
                size="12px"
                class="gt-xs"
                icon="visibility"
                @click="actionFocusLayer(item.vectorLayer)"
              />
            </div>
          </q-item-section>
          <q-separator />
        </q-item>
      </q-scroll-area>
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
import { useI18n } from "vue-i18n";
import { i18n } from "boot/i18n.js";
import { Map, View } from "ol";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";

import _difference from "lodash/difference";
import { getAllLocation, getLocation } from "src/api/location";
import {MAP_LAYERS} from "src/constants/layer.js";
import { actionAddLayer, transformProjection } from "src/utils/openLayers.js";
export default defineComponent({
  name: "TabLayer",
  components: {},
  setup() {
    const vm = getCurrentInstance().proxy;
    const $t = i18n.global.t;
    const map = inject("map", {});
    const locationSearchRef = ref(null);
    const search = ref("");
    const hint = ref("");
    const options = ref([]);
    const filterFn = (val, update, abort) => {
      if (val.length < 1) {
        abort();
        return;
      }
      update(async () => {
        const query = {
          search: val,
          search: val.replace(/[^a-zA-Z0-9\s]/g, ""),
        };
        const response = await getAllLocation(query);
        options.value = response;
      });
    };
    const location = ref(null);
    provide("location", location);
    const dataLayers = ref([]);
    const layerCheckbox = ref([]);
    const layerCheckAll = ref([]);
    const selectAll = (value, event) => {
      if (value[0]) {
        layerCheckbox.value = unref(dataLayers)
      } else {
        layerCheckbox.value = []
      }
    }
    const onClearSearch = () => {
      dataLayers.value = [];
      layerCheckbox.value = [];
      layerCheckAll.value = [];
    }
    const setModel = async (val) => {
      if (val) {
        location.value = await getLocation({ id: val.id });
        onClearSearch();
        dataLayers.value = unref(location).mapLayers;
        if (unref(location).view) {
          const { longitude, latitude, extent, zoom, maxZoom } = unref(location).view;
          if (unref(location).view.projection) {
            const { name: projectionName, definition: projectionDef } =
              unref(location).view.projection;
            proj4.defs(projectionName, projectionDef);
            register(proj4);
            const center = transformProjection({
              to: projectionName,
              definition: projectionDef,
              coordinates: [longitude, latitude]
            })
            const newView = new View({
              projection: projectionName,
              center,
              extent: JSON.parse(extent),
              zoom,
              maxZoom,
            });
            unref(map).setView(newView);
          }
        }
        unref(locationSearchRef).blur();
        hint.value = `${$t("Location")}: ${val.name}`;
      } else {
        hint.value = null;
      }
    };
    const actionFocusLayer = (vectorLayer) => {
      const extent = vectorLayer?.getSource?.()?.getExtent?.();
      unref(map).getView().fit(extent, {
              padding: [250, 250, 250, 250],
              duration: 1000
            });
    }
    onMounted(() => {
      console.log('tablayer mounted')
      watch(
        () => layerCheckbox.value,
        (newVal, oldVal) => {
          if (newVal.length > oldVal.length) {
          const diff = _difference(newVal, oldVal)
          const { workspace } = unref(location)
            diff.forEach((layer) => {
              const currentLayer = unref(dataLayers).find((l) => layer.id === l.id)
              if (currentLayer.vectorLayer) {
                layer.vectorLayer?.setVisible?.(true)
              } else {
                currentLayer.vectorLayer = actionAddLayer({ layer, workspace, map })
              }
            })
          } else {
            const diff = _difference(oldVal, newVal)
            const { workspace } = unref(location)
            diff.forEach((layer) => {
              if (layer.vectorLayer) {
                layer.vectorLayer?.setVisible?.(false)
              }
            })
          }
        }
      );
    })
    onUnmounted(() => {
      console.log("unmounted");
    });
    return {
      map,
      locationSearchRef,
      search,
      hint,
      options,
      filterFn,
      setModel,
      dataLayers,
      layerCheckbox,
      layerCheckAll,
      selectAll,
      actionFocusLayer,
    };
  },
});
</script>
<style lang="scss">
.layerClass {
  height: 100vh;
  max-height: 55vh;
  max-width: 300px;

  .q-scrollarea__content.absolute {
    // display: flex;
    // flex-direction: column-reverse;
  }
}
</style>
