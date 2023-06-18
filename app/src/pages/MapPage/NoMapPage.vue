<template>
    <div ref="mapRoot" class="mapView">
      <FloatZoom v-bind="{ map: map, view: view }" />
      <FloatControl v-bind="{ map: map, view: view }" @closePopup="closePopup" />
    </div>
    <div ref="popupRef" class="ol-popup">
      <q-btn
        ref="popupCloser"
        class="ol-popup-closer"
        flat
        round
        icon="close"
        @click="actionClosePopup"
      ></q-btn>
      <div ref="popupContent"></div>
    </div>
</template>

<script>
import "ol/ol.css";
import { Map, View, Overlay } from 'ol';
import { toStringHDMS } from "ol/coordinate";
import { Fill, Stroke, Style } from "ol/style";

import {  OSM as OSM} from 'ol/source';
import {  Tile as TileLayer } from 'ol/layer';
import { unByKey } from "ol/Observable";
import { scaleControl } from "src/utils/openLayers";
import { transform } from "ol/proj";
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';
proj4.defs('EPSG:32648', '+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs');
register(proj4);

import {
  defineComponent,
  ref,
  unref,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  provide,
} from "vue";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import { $bus } from "boot/bus.js";
import FloatControl from "src/components/floatControl/index.vue";
import FloatZoom from "src/components/floatZoom.vue";
export default defineComponent({
  name: "NoMapPage",
  components: {
    FloatZoom,
    FloatControl,
  },
  props: {},
  setup(props) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    // popup
    const popupRef = ref(null);
    const popupContent = ref(null);
    const popupCloser = ref(null);
    const popupEvent = ref(null);
    const overlay = ref(null);
    const addOverlay = () => {
      overlay.value = new Overlay({
        element: unref(popupRef),
        autoPan: {
          animation: {
            duration: 250,
          },
        },
      });
    };

    const closePopup = (state) => {
      if (state) {
        unByKey(unref(popupEvent));
        unref(overlay).setPosition(undefined);
      } else {
        initPopupEvent();
      }
    };
    $bus.on('close-popup', closePopup);
    const actionClosePopup = () => {
      unref(overlay).setPosition(undefined);
    };
    const initPopupEvent = () => {
      popupEvent.value = unref(map).on("singleclick", function (evt) {
        unref(map).forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          const name = layer?.get("name");
          const coordinate = evt.coordinate;
          const hdms = toStringHDMS(transform(coordinate, 'EPSG:5899',  'EPSG:4326')).replace('N ', 'N\n');

          unref(popupContent).innerHTML =
            "<p>" + name + "</p><pre>" + hdms + "</pre>";
          unref(overlay).setPosition(coordinate);
          return feature;
        });
      });
    };
    // popup

    /**
     *
     * @type {Map}
     */
    const map = ref(null);
    provide('map', map);
    const view = ref(
      new View({
        zoom: 0,
        center: [0, 0],
        maxZoom: 12,
      })
    );
    onMounted(() => {
      addOverlay();

      map.value = new Map({
        target: vm.$refs["mapRoot"],
        controls: [scaleControl],
        overlays: [unref(overlay)],
        layers: [
          new TileLayer({
            source: new OSM(), // tiles are served by OpenStreetMap
          }),
        ],
        // the map view will initially show the whole world
        view: unref(view),
      });
      initPopupEvent();
    });
    onUnmounted(() => {
      $bus.off('close-popup');
    });
    return {
      map,
      view,
      popupRef,
      popupCloser,
      actionClosePopup,
      popupContent,
      closePopup,
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

.mapView {
  height: 93vh;
  width: 100%;
  min-height: inherit;
  :global(.ol-scale-bar.ol-unselectable) {
    margin-left: 50px !important;
  }
  :global(.ol-scale-line) {
    right: 8px !important;
    left: auto;
  }
}


.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}
</style>
