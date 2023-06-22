<template>
  <div ref="mapRoot" class="mapView">
    <FloatZoom />
    <FloatControl v-bind="{ map: map, view: view }" @closePopup="closePopup" />
    <FloatDetail
      v-if="!showDetail"
      v-model="showDetail"
      v-bind="{ content: floatDetailContent }"
    />
    <FloatSearch />
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
import { Map, View, Overlay } from "ol";
import { toStringHDMS } from "ol/coordinate";
import { Fill, Stroke, Style } from "ol/style";

import { OSM, ImageWMS } from "ol/source";
import { Tile as TileLayer, Image, Vector as VectorLayer } from "ol/layer";
import { unByKey } from "ol/Observable";
import { scaleControl } from "src/utils/openLayers";
import { transform } from "ol/proj";
import {register} from 'ol/proj/proj4';
import {useLocationStore} from "stores/location";
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
import FloatSearch from "src/components/floatSearch/index.vue";
import FloatDetail from "src/components/floatDetail/index.vue";
import FloatControl from "src/components/floatControl/index.vue";
import FloatZoom from "src/components/floatZoom.vue";
import {
  FeatureUtils,
  distanceBetweenPoints
} from "src/utils/openLayers";
import { getFeature } from "src/api/feature";
export default defineComponent({
  name: "NoMapPage",
  components: {
    FloatSearch,
    FloatDetail,
    FloatControl,
    FloatZoom,
  },
  props: {},
  setup(props) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    //
    const locationStore = useLocationStore()
    const showDetail = ref(false);
    const floatDetailContent = ref(null);
    const onShowDetail = (html) => {
      showDetail.value = true;
      console.log(html);
    };
    $bus.on("on-show-detail", onShowDetail);
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
    $bus.on("close-popup", closePopup);
    const actionClosePopup = () => {
      let lastFeature = unref(popupEvent).lastFeature;
      lastFeature && lastFeature.setStyle(lastFeature.originStyle);
      unref(overlay).setPosition(undefined);
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
          return true;
        } else {
          return false;
        }
      };
      popupEvent.value = unref(map).on("singleclick", function (evt) {
        let location = locationStore.getStartLocation;
        location = transform(location, "EPSG:3857", (unref(map).getView().getProjection()))
        const distance = distanceBetweenPoints(location, evt.coordinate); //meters
        unref(map).forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
            if (layer instanceof VectorLayer) return
            const isHighLight = highLightFeature(feature, layer);
            const featureId = feature.getId();
            getFeature({ name: featureId })
            .then((response) => {
              console.log(response)
              showDetail.value = true;
              const propertiesToHTML = (obj) => {
                return Object.keys(obj).reduce((acc, k) => {
                  acc = acc + `<p>${k}: ${obj[k]}</p>`;
                  return acc;
                }, "");
              };
              floatDetailContent.value = propertiesToHTML(
                JSON.parse(response?.properties || null)
              );
            }).catch((e) => console.log(e))
            if (isHighLight === true) {
              const dataFeature = FeatureUtils.getDataOfFeature(feature, layer);
              const coordinate = evt.coordinate;
              dataFeature.setLocation(coordinate);
              unref(popupContent).innerHTML = dataFeature.getDisplayHtml();
              unref(overlay).setPosition(coordinate);
            } else {
              actionClosePopup();
            }
            return feature;
          }
        );
      });
    };
    // popup

    /**
     *
     * @type {Map}
     */
    const map = ref(null);
    provide("map", map);
    const view = ref(
      new View({
        zoom: 0,
        center: [0, 0],
        maxZoom: 12,
      })
    );
    onMounted(() => {
      addOverlay();
      const wmsSource = new ImageWMS({
        url: `${process.env.GEO_SERVER_URL}/ne/wms`,
        params: {
          LAYERS: "ne:world",
          FORMAT: "image/png", // Specify the desired image format
        },
        serverType: "geoserver",
      });

      // Create a new Image layer
      const imageLayer = new Image({
        source: wmsSource,
      });

      map.value = new Map({
        target: vm.$refs["mapRoot"],
        controls: [scaleControl],
        overlays: [unref(overlay)],
        layers: [
          // imageLayer,
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
      $bus.off("close-popup");
      $bus.off("on-show-detail");
    });
    return {
      map,
      view,
      showDetail,
      floatDetailContent,
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
