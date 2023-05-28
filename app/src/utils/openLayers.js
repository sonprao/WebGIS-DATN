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
  bar: true,
  steps: 4,
  text: true,
  minWidth: 100,
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

  // TODO: get other Properties of the feature here
}

// control

// export const getCurrentLocation = (map, view, oldCoordinates) => {
//   if (oldCoordinates) return null;
//   const geolocation = new Geolocation({
//     // enableHighAccuracy must be set to true to have the heading value.
//     trackingOptions: {
//       enableHighAccuracy: false,
//     },
//     projection: view.getProjection(),
//   });
//   const accuracyFeature = new Feature();
//   const positionFeature = new Feature();
//   positionFeature.setStyle(
//     new Style({
//       image: new CircleStyle({
//         radius: 6,
//         fill: new Fill({
//           color: "#3399CC",
//         }),
//         stroke: new Stroke({
//           color: "#fff",
//           width: 2,
//         }),
//       }),
//     })
//   );
//   geolocation.setTracking(true);
//   geolocation.on("change:accuracyGeometry", function () {
//     accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
//   });
//   geolocation.on("change:position", function () {
//     const coordinates = geolocation.getPosition();
//     console.log(coordinates);
//     positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
//   });
  // const vectorGeo = new VectorLayer({
  //   map: map,
  //   source: new VectorSource({
  //     features: [accuracyFeature, positionFeature],
  //   }),
  // });
  // map.removeLayer(vectorGeo);
// };

export class GeoLocation {
  constructor(option = {}) {
    this.map = option.map;
    this.view = option.view;
    this.geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: false,
      },
      projection: this.view.getProjection(),
    });
    this.accuracyFeature = new Feature();
    this.positionFeature = new Feature();

    this.positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: "#3399CC",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
      })
    );
    this.geolocation.setTracking(true);
    this.geolocation.on("change:accuracyGeometry", function () {
      this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
    });
    this.geolocation.on("change:position", function () {
      const coordinates = this.geolocation.getPosition();
      this.positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
    });
    // this.vectorGeo = new VectorLayer({
    //   map: this.map,
    //   source: new VectorSource({
    //     features: [this.accuracyFeature, this.positionFeature],
    //   }),
    // });
  }
  getCurrentLocation() {
    new VectorLayer({
      map: this.map,
      source: new VectorSource({
        features: [this.accuracyFeature, this.positionFeature],
      }),
    });
  }
}
