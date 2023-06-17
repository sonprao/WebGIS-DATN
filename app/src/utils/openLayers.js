import {Fill, Stroke, Text, Style, Circle as CircleStyle} from "ol/style";
import {ScaleLine} from "ol/control";
import VectorSource from "ol/source/Vector";
import {Vector as VectorLayer} from "ol/layer";
import {Draw, Modify, Snap} from "ol/interaction";
// geolocation
import Geolocation from "ol/Geolocation";
import View from "ol/View";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
// vue
import {ref, unref} from "vue";
import {i18n} from "boot/i18n.js";
import {
  CityLandDataFeature,
  BaseDataFeature,
  RoadDataFeature,
  SOIL_TYPE_ID, ForestLandDataFeature
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
    fill: new Fill({color: fillColor}),
    stroke: new Stroke({color: outlineColor, width: 3}),
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
      case "Sơ đồ đất": {
        switch (feature.get("SoilTypeId")) {
          case SOIL_TYPE_ID.DAT_DON_VI_O:
            featureData = new CityLandDataFeature();
            break;
          case SOIL_TYPE_ID.DAT_RUNG:
            featureData = new ForestLandDataFeature();
            break;
          default:
            BaseDataFeature();
        }
      }
        break;
      case "Giao thông":
        featureData = new RoadDataFeature();
        break;
      case "": {
        break;
      }
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
