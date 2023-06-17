import { Fill, Stroke, Text, Style, Circle as CircleStyle } from "ol/style";
import { ScaleLine } from "ol/control";
import VectorSource from "ol/source/Vector";
import {
  Vector as VectorLayer,
  VectorImage as VectorImageLayer
} from "ol/layer";
import GeoJSON from "ol/format/GeoJSON";
import { Draw, Modify, Snap } from "ol/interaction";
// geolocation
import Geolocation from "ol/Geolocation";
import View from "ol/View";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
// vue
import { ref, unref } from "vue";
import { i18n } from "boot/i18n.js";
import {
  CityLandDataFeature,
  BaseDataFeature
} from "src/feature/FeatureData.js"
const $t = i18n.global.t;

const getText = function (feature, resolution, dom) {
  const type = "wrap";
  const maxResolution = 600;
  let text = ""; //dom.label;

  if (resolution > maxResolution) {
    text = "";
  } else if (type == "hide") {
    text = "";
  } else if (type == "shorten") {
    text = text.trunc(12);
  }
  // else if (type == 'wrap') {
  //   text = stringDivider(text, 16, '\n');
  // }

  return text;
};

export const createTextStyle = function (feature, resolution, dom) {
  const size = "12px";
  const height = 1;
  const weight = "bold";
  // const maxAngle = dom.maxangle ? parseFloat(dom.maxangle.value) : undefined;
  const overflow = "true";
  // if (dom.font.value == "'Open Sans'" && !openSansAdded) {
  //   const openSans = document.createElement('link');
  //   openSans.href = 'https://fonts.googleapis.com/css?family=Open+Sans';
  //   openSans.rel = 'stylesheet';
  //   document.head.appendChild(openSans);
  //   openSansAdded = true;
  // }
  const font = weight + " " + size + "/" + height + " " + "arial";
  const fillColor = dom.layer_color;
  const outlineColor = "#fffff";

  return new Text({
    textAlign: "center",
    textBaseline: "middle",
    font: font,
    text: getText(feature, resolution, dom),
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ color: outlineColor, width: 3 }),
    offsetX: 0,
    offsetY: 0,
    placement: "point",
    // maxAngle: maxAngle,
    overflow: overflow,
    rotation: 0,
  });
};

// control
export const scaleControl = new ScaleLine({
  units: "metric",
  minWidth: 50,
});

export const zoomMapToLayer = function (map, vectorLayer) {
  let vectorSource = vectorLayer.getSource();
  vectorSource.once('change', () => {
    if (vectorSource.getState() === 'ready') {
      const extent = vectorSource.getExtent();

      unref(map).getView().fit(extent, {
        padding: [250, 250, 250, 250],
        duration: 1000
      });
    }
  });
}

export const FeatureUtils = {
  /**
   *
   * @param feature {Feature}
   */
  getNameOfFeature: function (feature) {
    let name = feature.get("name");
    if (!name) return null;
    return convertToCorrectFormat(name);
  },

  /**
   *
   * @param feature {Feature}
   * @param layer {VectorLayer}
   * @returns {BaseDataFeature}
   */
  getDataOfFeature: function (feature, layer) {
    /**
     *
     * @type {BaseDataFeature}
     */
    let featureData;
      switch (layer.get("name")) {
        case "Sơ đồ đất":
          featureData = new CityLandDataFeature();
          break;
        default:
          featureData = new BaseDataFeature();
          break;
      }
      console.log(layer, layer.get("name"));
      featureData.setData(feature);
      console.log(featureData, feature);
      return featureData;
  },
  /**
   *
   * @param style {}
   * @returns {Style}
   */
  getSelectedStyle: function (style) {
    return new Style({
      stroke: new Stroke({
        color: "BLUE",
        width: 3,
      }),
      fill: style().getFill(),
    })
  },

  // TODO: get other Properties of the feature here
}

// control
import { transform } from "ol/proj";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";

export const transformProjection = (option) => {
  const { from = 'EPSG:4326', to = 'EPSG:4326', definition = '', coordinates = [0, 0] } = option
  if (from !== 'EPSG:4326') {
    proj4.defs(from, definition);
  } else if (to !== 'EPSG:4326') {
    proj4.defs(to, definition);
  }
  register(proj4);

  return transform(coordinates, from, to);

}

export const getGeoJsonUrl = function (workspace, urlName) {
  return `${process.env.GEO_SERVER_URL}/${workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${urlName}&maxFeatures=50&outputFormat=application%2Fjson`
}
export const randomColor = function () {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}
export const actionAddLayer = ({ layer, workspace, map }) => {
  // for (const [index, ly] of Object.entries(unref(map).getLayers().getArray())) {
  //   if (ly instanceof VectorImageLayer && ly.get('id') === layer.id) {
  //     ly.setVisible(true)
  //     return
  //   }
  // }
   const currentLayer = unref(map).getLayers().getArray().find(
    (ly) => ly.get('id') === layer.id && ly instanceof VectorImageLayer
   )
  if (currentLayer) {
    currentLayer.setVisible(true)
    return
  }
  const color =  randomColor()
  const polygonStyleFunction = function (feature, resolution) {
    return new Style({
      stroke: new Stroke({
        // color,//layer.layer_color,
        width: 1,
      }),
      fill: new Fill({
        color, //layer.layer_color,
      }),
      text: createTextStyle(feature, resolution, layer),
    });
  };
  const vectorLayer = new VectorImageLayer({
    id: layer.id,
    name: layer.name,
    source: new VectorSource({
      format: new GeoJSON(),
      url: getGeoJsonUrl(workspace, layer.url),
    }),
    style: polygonStyleFunction,
    zindex: 1,
  });
  unref(map).addLayer(vectorLayer);
  return vectorLayer
  // zoomMapToLayer(map, vectorLayer);
};
