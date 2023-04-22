<template>
  <div ref="mapRoot" class="mapView">
    <FloatAction v-bind="floatActionBind" @changeLayers="changeLayers" />
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
import View from "ol/View";
import Map from "ol/Map";
import Overlay from "ol/Overlay.js";
import { toLonLat } from "ol/proj.js";
import { toStringHDMS } from "ol/coordinate.js";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Fill, Stroke, Style } from "ol/style.js";
// importing the OpenLayers stylesheet is required for having
// good looking buttons!
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
// import VectorImageLayer from 'ol/layer/VectorImage.js';

// import customjson from '../constants/danang.json'
import {
  defineComponent,
  ref,
  unref,
  onMounted,
  getCurrentInstance,
} from "vue";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import _difference from "lodash/difference";
import FloatAction from "src/components/floatAction.vue";
import _filterOptions from "../../public/layers.json";
import testDataJson from "../../public/RungPhongHo.json";
import { createTextStyle } from "src/utils/openLayers";
export default defineComponent({
  name: "MapContainer",
  components: {
    FloatAction,
  },
  props: {},
  setup(props) {
    // const itext = i18n.global.t('common.user')
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const layers = ref([]);
    const floatActionBind = {
      filterOptions: _filterOptions,
    };
    const changeLayers = (_layers) => {
      if (_layers.length > unref(layers).length) {
        const newLayer = _difference(_layers, unref(layers));
        layers.value = _layers;
        actionAddLayer(newLayer[0]);
      } else {
        const newLayer = _difference(unref(layers), _layers);
        layers.value = _layers;
        actionRemoveLayer(newLayer[0]);
      }
    };
    const actionRemoveLayer = (url) => {
      const myDom = _filterOptions.find((option) => option.value === url);
      unref(map)
        .getLayers()
        .getArray()
        .slice()
        .some((layer) => {
          if (layer && layer.get("url") === url) {
            unref(map).removeLayer(layer);
            return
          }
        });
    };
    const actionAddLayer = (url) => {
      const myDom = _filterOptions.find((option) => option.value === url);
      const polygonStyleFunction = function (feature, resolution) {
        return new Style({
          stroke: new Stroke({
            color: myDom.layer_color,
            width: 1,
          }),
          fill: new Fill({
            color: myDom.layer_color,
          }),
          text: createTextStyle(feature, resolution, myDom),
        });
      };
      const vectorLayer = new VectorLayer({
        name: myDom.label,
        url,
        source: new VectorSource({
          format: new GeoJSON(),
          url,
        }),
        style: polygonStyleFunction,
      });
      unref(map).addLayer(vectorLayer);
    };
    // popup
    const popupRef = ref(null);
    const popupContent = ref(null);
    const popupCloser = ref(null);
    const overlay = ref(null);
    const addOverLay = () => {
      overlay.value = new Overlay({
        element: unref(popupRef),
        autoPan: {
          animation: {
            duration: 250,
          },
        },
      });
    };
    const actionClosePopup = () => {
      unref(overlay).setPosition(undefined);
    };
    // popup

    const map = ref(null);
    onMounted(() => {
      // this is where we create the OpenLayers map
      addOverLay();
      map.value = new Map({
        target: vm.$refs["mapRoot"],
        overlays: [unref(overlay)],
        layers: [
          new TileLayer({
            source: new OSM(), // tiles are served by OpenStreetMap
          }),
        ],
        // the map view will initially show the whole world
        view: new View({
          zoom: 11,
          center: [12031372.797987673, 1801884.1655095597],
          maxZoom: 17,
          // constrainResolution: true
        }),
      });
      unref(map).on("singleclick", function (evt) {
        unref(map).forEachFeatureAtPixel(
          evt.pixel,
          (feature, layer) => {
            const name = layer.get('name')
            const coordinate = evt.coordinate;
            const hdms = toStringHDMS(toLonLat(coordinate));
            
            unref(popupContent).innerHTML =
            "<p>" +name+"</p><code>" + hdms + "</code>";
            unref(overlay).setPosition(coordinate);
            return feature;
          }
        );
      });
    });
    return {
      // actionAddLayer,
      floatActionBind,
      changeLayers,
      popupRef,
      popupCloser,
      actionClosePopup,
      popupContent,
    };
  },
});
</script>
<style scoped>
html,
body {
  width: 100%;
  height: 100%;
}

.mapView {
  height: 1000px;
  width: 100%;
  min-height: inherit;
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
