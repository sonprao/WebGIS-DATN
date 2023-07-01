<template>
  <div ref="mapRoot" class="mapView">
    <FloatZoom data-html2canvas-ignore />
    <FloatControl data-html2canvas-ignore v-bind="{ map: map, view: view }" @closePopup="closePopup" />
    <FloatDetail v-if="showDetail" data-html2canvas-ignore v-model="showDetail" v-bind="floatDetailProps"
      @update:model-content="floatDetailProps.content = $event" />
    <FloatSearch data-html2canvas-ignore />
  </div>
  <div ref="popupRef" class="ol-popup">
    <q-btn ref="popupCloser" class="ol-popup-closer" flat round icon="close" @click="actionClosePopup"></q-btn>
    <div ref="popupContent"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View, Overlay } from "ol";
import { toStringHDMS } from "ol/coordinate";
import { Fill, Stroke, Style } from "ol/style";

import { OSM, ImageWMS, XYZ } from "ol/source";
import { Tile as TileLayer, Image, Vector as VectorLayer } from "ol/layer";
import { unByKey } from "ol/Observable";
import { scaleControl } from "src/utils/openLayers";
import { transform } from "ol/proj";
import { register } from 'ol/proj/proj4';
import { useLocationStore } from "stores/location";
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
import _debounce from 'lodash/debounce';
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import { $bus } from "boot/bus.js";
import FloatSearch from "src/components/floatSearch/index.vue";
import FloatDetail from "src/components/floatDetail/index.vue";
import FloatControl from "src/components/floatControl/index.vue";
import FloatZoom from "src/components/floatZoom.vue";
import {
  FeatureUtils,
  distanceBetweenPoints,
} from "src/utils/openLayers";
import { getFeature } from "src/api/feature";
import { captureScreenshot } from "src/utils/html2Canvas";
import { LAYER_TYPE } from "src/constants/enum";

export default defineComponent({
  name: "IndexPage",
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
    const floatDetailProps = ref({
      title: null,
      image: 'https://cdn.quasar.dev/img/chicken-salad.jpg',
      content: {},
      type: LAYER_TYPE[0],
      id: null,
      coordinate: null,
    })
    const onShowDetail = (option) => {
      const { content, image, title, type = LAYER_TYPE[0], coordinate } = option
      showDetail.value = true;
      if (title) {
        floatDetailProps.value.title = title
      }
      if (image) {
        floatDetailProps.value.image = image
      }
      if (content) {
        floatDetailProps.value.content = typeof content === 'string' ? JSON.parse(content) : content;
      }
      if (coordinate) {
        floatDetailProps.value.coordinate = coordinate
      }
      if (type !== LAYER_TYPE[0]) {
        floatDetailProps.value.type = type
      }
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
      if (state === true) {
        let lastFeature = unref(popupEvent).lastFeature;
        lastFeature && lastFeature.setStyle(lastFeature.originStyle);
        unref(popupEvent).lastFeature = null;
        // unByKey(unref(popupEvent));
        // unref(overlay).setPosition(undefined); obsolete
      }
    };
    $bus.on("close-popup", closePopup);
    $bus.on("close-float-detail", closePopup);
    const actionClosePopup = () => {
      let lastFeature = unref(popupEvent).lastFeature;
      lastFeature && lastFeature.setStyle(lastFeature.originStyle);
      unref(overlay).setPosition(undefined);
    };
    const getFeatureAPI = _debounce((featureId) => {
      getFeature({ name: featureId })
        .then((response) => {
          floatDetailProps.value.id = response.id
          onShowDetail({
            content: JSON.parse(response?.properties || false)
          })
        }).catch((e) => console.log(e))
    }, 200)
    const initPopupEvent = () => {
      const highLightFeature = function (feature, layer) {
        let lastFeature = unref(popupEvent).lastFeature;
        lastFeature && lastFeature.setStyle(lastFeature.originStyle);
        unref(popupEvent).lastFeature = null;
        feature.originStyle = feature.getStyle();
        if (!feature.originStyle) return
        let selectedStyle = FeatureUtils.getSelectedStyle(feature.originStyle);
        if (feature !== lastFeature) {
          const a = feature.setStyle(selectedStyle);
          unref(popupEvent).lastFeature = feature;
          setTimeout(() => {
            captureScreenshot().then((response) => {
              floatDetailProps.value.image = response
            });
          }, 1000);
          return true;
        } else {
          return false;
        }
      };
      popupEvent.value = unref(map).on("singleclick", function (evt) {
        let location = locationStore.getStartLocation;
        location = transform(location, "EPSG:3857", (unref(map).getView().getProjection()))
        floatDetailProps.value.distance = distanceBetweenPoints(location, evt.coordinate);
        unref(map).forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          if (layer instanceof VectorLayer) return
          const isHighLight = highLightFeature(feature, layer);
          if (isHighLight === true) {
            const featureId = feature.getId();
            unref(map).getView().fit(feature.getGeometry().getExtent(), {
              padding: [250, 250, 250, 250],
              duration: 1000,
            });
            const dataFeature = FeatureUtils.getDataOfFeature(feature, layer);
            const coordinate = evt.coordinate;
            dataFeature.setLocation(coordinate);
            // unref(popupContent).innerHTML = dataFeature.getDisplayHtml();
            // unref(overlay).setPosition(coordinate); obsolete
            // set float detail
            getFeatureAPI(featureId);
            // screenshot
            floatDetailProps.value.title = dataFeature.name;
            floatDetailProps.value.coordinate =
              toStringHDMS(
                transform(
                  coordinate,
                  unref(map).getView().getProjection().getCode(),
                  'EPSG:4326'
                )
              ).replace('N ', 'N\n');
            // set float detail
          } else {
            showDetail.value = false;
            closePopup(true);
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
      const worldImagery = new TileLayer({
        source: new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 19
        })
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
          // worldImagery,
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
      $bus.off("close-float-detail");
      $bus.off("on-show-detail");
    });
    return {
      map,
      view,
      showDetail,
      floatDetailProps,
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

  // :global(.ol-scale-line) {
  //   right: 8px !important;
  //   left: auto;
  // }
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
