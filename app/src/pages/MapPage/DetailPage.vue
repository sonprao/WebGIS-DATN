<template>
  <div ref="mapRoot" class="mapView">
    <FloatZoom v-bind="{ map: map, view: view }"/>
    <FloatControl v-bind="{ map: map, view: view }" @closePopup="closePopup"/>
    <FloatAction v-bind="floatActionBind" @changeLayers="changeLayers"/>
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
import {Map, View, Overlay} from 'ol';

import {transform} from "ol/proj";
import {toStringHDMS} from "ol/coordinate";
import {Fill, Stroke, Style} from "ol/style";
import {Draw, Modify, Snap} from "ol/interaction";
import GeoJSON from "ol/format/GeoJSON";
import {
  OSM,
  TileWMS,
  ImageWMS,
  Vector as VectorSource
} from 'ol/source';
import {
  Tile as TileLayer,
  Image as ImageLayer,
  Vector as VectorLayer,
  VectorImage as VectorImageLayer
} from 'ol/layer';
import {unByKey} from "ol/Observable";
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';

proj4.defs('EPSG:32648', '+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs');
register(proj4);
proj4.defs('EPSG:5899', '+proj=tmerc +lat_0=0 +lon_0=107.75 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.904,-39.303,-111.450,0.00928836,0.01975479,-0.00427372,0.25290627854559 +units=m +no_defs');
register(proj4);
import {
  scaleControl,
  zoomMapToLayer,
  createTextStyle,
  FeatureUtils,
} from "src/utils/openLayers";

import {
  LayerController
} from "src/utils/layerController";

import {
  defineComponent,
  ref,
  unref,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  h,
  render,
  createApp,
  provide,
} from "vue";
import {useQuasar} from "quasar";
import {i18n} from "boot/i18n.js";
import {$bus} from "boot/bus.js";
import _difference from "lodash/difference";
import FloatAction from "src/components/floatAction.vue";
import FloatControl from "src/components/floatControl/index.vue";
import FloatZoom from "src/components/floatZoom.vue";
import _filterOptions from "src/constants/layers.json";

export default defineComponent({
  name: "DetailPage",
  components: {
    FloatZoom,
    FloatAction,
    FloatControl,
  },
  props: {},
  setup(props) {
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
      // const myDom = _filterOptions.find((option) => option.value === url);
      // unref(map)
      //   .getLayers()
      //   .getArray()
      //   .slice()
      //   .some((layer) => {
      //     if (layer && layer.get("name") === myDom.label) {
      //       unref(map).removeLayer(layer);
      //       return;
      //     }
      //   });
      let layer = layerController.getLayer(url);
      layer.setVisible(false);
    };
    const actionAddLayer = (url) => {
      let vectorLayer = layerController.getLayer(url);
      if (!layerController.getLayer(url)) {
        const myDom = _filterOptions.find((option) => option.value === url);
        const polygonStyleFunction = function (feature, resolution) {
          return new Style({
            stroke: new Stroke({
              color: "RED",
              width: 0.25,
            }),
            fill: new Fill({
              color: myDom.layer_color,
            }),
            text: createTextStyle(feature, resolution, myDom),
          });
        };
        const _workspace = 'danang';
        const _url =
          `${process.env.GEO_SERVER_URL}/${_workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${url}&maxFeatures=52000&outputFormat=application%2Fjson`
        vectorLayer = new VectorImageLayer({
          name: myDom.label,
          source: new VectorSource({
            format: new GeoJSON(),
            url: _url,
          }),
          style: polygonStyleFunction,
          zindex: 1,
        });
        layerController.addLayer(url, vectorLayer);
        unref(map).addLayer(vectorLayer);

        let vectorSource = vectorLayer.getSource();
        vectorSource.once('change', () => {
          vectorSource.getFeatures().forEach((feature) => {
            feature.setStyle(vectorLayer.getStyle()());
            FeatureUtils.setStyleBySoilType(feature);
          })
        });
      }
      vectorLayer.setVisible(true);
    };
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
    const initPopupEvent = () => {
      const highLightFeature = function (feature, layer) {
        let lastFeature = unref(popupEvent).lastFeature;
        lastFeature && lastFeature.setStyle(lastFeature.originStyle);
        feature.originStyle = feature.getStyle();
        let selectedStyle = FeatureUtils.getSelectedStyle(feature.getStyle());
        unref(popupEvent).lastFeature = null;
        if (feature !== lastFeature) {
          feature.setStyle(selectedStyle);
          unref(popupEvent).lastFeature = feature;
        }
      }

      popupEvent.value = unref(map).on("singleclick", function (evt) {
        unref(map).forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
            highLightFeature(feature, layer);
            const dataFeature = FeatureUtils.getDataOfFeature(feature, layer);
            const coordinate = evt.coordinate;
            dataFeature.setLocation(coordinate);
            unref(popupContent).innerHTML = dataFeature.getDisplayHtml();
            unref(overlay).setPosition(coordinate);
            return feature;
          }
        );
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

      // popup
    /**
     *
     * @type {Map}
     */
    const map = ref(null);
    const layerController = new LayerController();
    provide('map', map);
    const view = ref(
      new View({
        zoom: 11,
        projection: 'EPSG:5899',
        center: [547944, 1779004],
        maxZoom: 17,
        // extent: [508944, 1750004, 588944, 1800004],
        // constrainResolution: true
      })
    );
    onMounted(() => {
      addOverlay();

      // this is where we create the OpenLayers map
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
      floatActionBind,
      changeLayers,
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
