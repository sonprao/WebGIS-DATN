<template>
  <q-page-sticky class="stickyClass" position="top-left" :offset="[350, 10]">
    <q-select
      class="searchClass"
      ref="locationSearchRef"
      v-model="searchLocation"
      rounded
      outlined
      bg-color="white"
      color="teal"
      use-input
      hide-dropdown-icon
      input-debounce="400"
      label="Select location"
      option-label="name"
      option-value="name"
      :options="options"
      @filter="filterFn"
      @update:model-value="setModel"
    >
      <template v-slot:append>
        <q-icon name="search" color="teal"/>
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ $t("No results") }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </q-page-sticky>
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
// import { $bus } from "boot/bus.js";
import { i18n } from "boot/i18n.js";
import _difference from "lodash/difference";

import { Map, View } from "ol";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import {  transformProjection } from "src/utils/openLayers.js";

import { useMapStore } from "stores/map";
import { getAllLocation, getLocation } from "src/api/location";
export default defineComponent({
  name: "FloatSearch",
  props: {
    value: Boolean,
    content: String,
  },
   setup() {
     const $t = i18n.global.t;
     const map = inject("map", {});
     const mapStore = useMapStore();
    const locationSearchRef = ref(null);
    const searchLocation = ref("");
    const options = ref([]);
    const defaultOptions = ref([]);
    const filterFn = (val, update, abort) => {
      if (val.length < 2) {
        // abort();
        update(async () => {
          options.value = unref(defaultOptions);
        });
      } else {
        update(async () => {
          const query = {
            search: val.replace(/[^a-zA-Z0-9\s]/g, ""),
          };
          const response = await getAllLocation(query);
          options.value = response;
        });
      }
    };
    const location = ref(null);
    const onClearSearch = () => {
    };
     const setModel = async (val) => {
      if (val) {
        location.value = await getLocation({ id: val.id });
        mapStore.setLocation({
          location: unref(location),
          resolve: setView,
        })
      }
      unref(locationSearchRef).blur();
     };
     const setView = () => {
      if (unref(location).view) {
          const { longitude, latitude, extent, zoom, maxZoom } =
            unref(location).view;
          if (unref(location).view.projection) {
            const { name: projectionName, definition: projectionDef } =
              unref(location).view.projection;
            proj4.defs(projectionName, projectionDef);
            register(proj4);
            const center = transformProjection({
              to: projectionName,
              definition: projectionDef,
              coordinates: [longitude, latitude],
            });
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
    }
     onMounted(() => {
      console.log("TabLocation mounted");
      const query = {
        page: 1,
        per_page: 10,
      };
      getAllLocation(query).then((response) => {
        defaultOptions.value = response;
      });
    });
    onUnmounted(() => {
      console.log("unmounted");
    });
    return {
      map,
      locationSearchRef,
      searchLocation,
      options,
      filterFn,
      setModel,
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

.searchClass {
  width: 400px;
  color: teal;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  border-radius: 28px;

  &:focus {
    color: teal;
  }
}
// .q-field__native .q-placeholder {
//   color: black;

//   &:focus {
//     color: black;
//   }
// }
</style>
