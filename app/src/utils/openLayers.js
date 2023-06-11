import { Fill, Stroke, Text, Style, Circle as CircleStyle } from "ol/style";
import { ScaleLine } from "ol/control";
import VectorSource from "ol/source/Vector";
import { Vector as VectorLayer } from "ol/layer";
import { Draw, Modify, Snap } from "ol/interaction";
// geolocation
import Geolocation from "ol/Geolocation";
import View from "ol/View";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
// vue
import { ref, unref } from "vue";
import { i18n } from "boot/i18n.js";
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


const convertToCorrectFormat = function (string) {
  return decodeURIComponent(escape(string));
}
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

  getSelectedStyle: function () {
    return new Style({
      stroke: new Stroke({
        color: "red",
        width: 1,
      }),
      fill: new Fill({
        color: "#FFFFFF",
      }),
    })
  },

  // TODO: get other Properties of the feature here
}

// control
