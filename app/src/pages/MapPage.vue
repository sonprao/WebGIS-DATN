<template>
  <div ref="mapRoot" class="mapView">
    <FloatAction v-bind="floatActionBind" @changeLayers="changeLayers" />
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
import View from "ol/View";
import Map from "ol/Map";
import { Draw, Modify, Snap } from "ol/interaction";
import { ScaleLine, defaults as defaultControls } from "ol/control";
import Overlay from "ol/Overlay";
import { toLonLat } from "ol/proj";
import { toStringHDMS } from "ol/coordinate";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Fill, Stroke, Style } from "ol/style";
// importing the OpenLayers stylesheet is required for having
// good looking buttons!
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorImageLayer from "ol/layer/VectorImage";
import TileWMS from "ol/source/TileWMS";
import ImageWMS from "ol/source/ImageWMS";
import { Image as ImageLayer } from 'ol/layer';
import { unByKey } from "ol/Observable";

// import customjson from '../constants/danang.json'
import {
  defineComponent,
  ref,
  unref,
  onMounted,
  getCurrentInstance,
  h,
  render,
  createApp,
} from "vue";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import _difference from "lodash/difference";
import FloatAction from "src/components/floatAction.vue";
import FloatControl from "src/components/floatControl.vue";
import _filterOptions from "../../public/layers.json";
import testDataJson from "../../public/RungPhongHo.json";
import {
  createTextStyle,
  scaleControl, zoomMapToLayer,
} from "src/utils/openLayers";
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';
proj4.defs('EPSG:32648', '+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs');
register(proj4);
proj4.defs('EPSG:5899', '+proj=tmerc +lat_0=0 +lon_0=107.75 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.904,-39.303,-111.450,0.00928836,0.01975479,-0.00427372,0.25290627854559 +units=m +no_defs');
register(proj4);
export default defineComponent({
  name: "MapContainer",
  components: {
    FloatAction,
    FloatControl,
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
          // if (layer && layer.get("url") === url) {
          if (layer && layer.get("name") === myDom.label) {
            unref(map).removeLayer(layer);
            return;
          }
        });
    };
    const actionAddLayer = (url) => {
      // const vectorLayer = new TileLayer({
      //   extent: [xmin, ymin, xmax, ymax],
      //   source: new TileWMS({
      //     url: 'http://localhost:8081/geoserver/ne/wms',
      //     params: {
      //       // 'TRANSPARENT': true,
      //       // 'STYLES': null,
      //       'LAYERS': 'ne:world',
      //       'TILED' : true,
      //       // 'exceptions': 'application/vnd.ogc.se_inimage',
      //       // WIDTH: 769,
      //       // HEIGHT: 468,
      //       // TILED: true,
      //       // 'VERSION': '1.1.1',
      //       // // 'SRS': 'EPSG:2044',
      //       // FORMAT: 'image/png',
      //       // 'BBOX': xmin + ',' + ymin + ',' + xmax + ',' + ymax,
      //     },
      //     serverType: 'geoserver',
      //     // projection: unref(view).getProjection(),
      //   })
      // })
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
      const _workspace = 'Danang2';
      const _name = "cam_le__vn_";
      const _url =
        `http://localhost:8080/geoserver/${_workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${_workspace}:${_name}&maxFeatures=50&outputFormat=application%2Fjson`
      const vectorLayer = new VectorImageLayer({
        name: myDom.label,
        source: new VectorSource({
          format: new GeoJSON(),
          url: "http://localhost:8080/geoserver/Danang2/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Danang2%3Aho_1&maxFeatures=50&outputFormat=application%2Fjson",
        }),
        style: polygonStyleFunction,
        zindex: 1,
      });
      unref(map).addLayer(vectorLayer);
      zoomMapToLayer(map, vectorLayer);
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
      popupEvent.value = unref(map).on("singleclick", function (evt) {
        unref(map).forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          const name = layer?.get("name");
          const coordinate = evt.coordinate;
          const hdms = toStringHDMS(toLonLat(coordinate));

          unref(popupContent).innerHTML =
            "<p>" + name + "</p><code>" + hdms + "</code>";
          unref(overlay).setPosition(coordinate);
          return feature;
        });
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
    const actionClosePopup = () => {
      unref(overlay).setPosition(undefined);
    };
    // popup

    // draw

    // draw
    /**
     *
     * @type {Map}
     */
    const map = ref(null);
    const view = ref(
      new View({
        zoom: 11,
        projection: 'EPSG:5899',
        center: [548944,1770004],
        maxZoom: 17,
        projection: 'EPSG:32648'
        // extent: [xmin, ymin, xmax, ymax]
        // constrainResolution: true
      })
    );
    onMounted(() => {
      addOverlay();

      // this is where we create the OpenLayers map
      map.value = new Map({
        target: vm.$refs["mapRoot"],
        controls: [scaleControl],
        // controls: defaultControls().extend([scaleControl]),
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
      vm.$nextTick(() => {
        // const parser = new WMSCapabilities();
        // fetch('getcapabilities_1.1.1.xml')
        //   .then(function (response) {
        //     return response.text();
        //   })
        //   .then(function (text) {
        //     const result = parser.read(text);
        //     console.log(result);
        //     // console.log(JSON.stringify(result, null, 2));
        //   });
      });
    });
    return {
      // actionAddLayer,
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
<style scoped>
html,
body {
  width: 100%;
  height: 100%;
}

.mapView {
  height: 680px;
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
